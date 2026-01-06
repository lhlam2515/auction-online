import type { RatingWithUsers } from "@repo/shared-types";
import { eq, and, or, count } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, ratings, users } from "@/models";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";

export class RatingService {
  async getByUser(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ) {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      db.query.ratings.findMany({
        where: eq(ratings.receiverId, userId),
        with: {
          sender: {
            columns: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: (rating, { asc, desc }) => [
          sortOrder === "asc" ? asc(rating.createdAt) : desc(rating.createdAt),
        ],
        limit,
        offset,
      }),
      db
        .select({ count: count() })
        .from(ratings)
        .where(eq(ratings.receiverId, userId)),
    ]);

    const total = totalResult[0]?.count || 0;

    return toPaginated(
      items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })) as RatingWithUsers[],
      page,
      limit,
      total
    );
  }

  async createFeedback(
    orderId: string,
    userId: string,
    rating: number,
    comment?: string
  ) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Handle nullable fields - cannot leave feedback if users deleted
    if (!order.winnerId || !order.sellerId) {
      throw new BadRequestError(
        "Cannot leave feedback - buyer or seller information is missing"
      );
    }

    // Check if user is buyer or seller of this order
    if (order.winnerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenError(
        "Not authorized to leave feedback for this order"
      );
    }

    // Can only leave feedback for completed or cancelled orders
    if (order.status !== "COMPLETED" && order.status !== "CANCELLED") {
      throw new BadRequestError(
        "Can only leave feedback for completed or cancelled orders"
      );
    }

    // Determine receiver (the other party in the transaction)
    const receiverId =
      order.winnerId === userId ? order.sellerId : order.winnerId;

    // Handle nullable productId
    if (!order.productId) {
      throw new BadRequestError(
        "Cannot leave feedback - product information is missing"
      );
    }

    // Check if user already left feedback for this specific order
    // Query by checking productId + senderId + correct receiver to ensure it's from this order
    const existingFeedback = await db.query.ratings.findFirst({
      where: and(
        eq(ratings.orderId, order.id),
        eq(ratings.senderId, userId),
        eq(ratings.receiverId, receiverId)
      ),
    });

    if (existingFeedback) {
      throw new BadRequestError("You already left feedback for this order");
    }

    // Create rating record
    const [newRating] = await db
      .insert(ratings)
      .values({
        orderId: order.id,
        senderId: userId,
        receiverId,
        score: rating,
        comment: comment || null,
      })
      .returning();

    // Update receiver's rating score and count
    const receiver = await db.query.users.findFirst({
      where: eq(users.id, receiverId),
    });

    if (receiver) {
      const newRatingCount = receiver.ratingCount + 1;
      const newRatingScore =
        (receiver.ratingScore * receiver.ratingCount + rating) / newRatingCount;

      await db
        .update(users)
        .set({
          ratingScore: newRatingScore,
          ratingCount: newRatingCount,
          updatedAt: new Date(),
        })
        .where(eq(users.id, receiverId));
    }

    return newRating;
  }

  async getByOrder(orderId: string, userId: string) {
    const order = await db.query.orders.findFirst({
      where: or(eq(orders.winnerId, userId), eq(orders.sellerId, userId)),
    });

    if (!order) {
      throw new NotFoundError("Order not found or access denied");
    }

    const feedbacks = await db.query.ratings
      .findMany({
        where: and(
          eq(ratings.orderId, orderId),
          or(eq(ratings.senderId, userId), eq(ratings.receiverId, userId))
        ),
        with: {
          sender: {
            columns: { fullName: true, avatarUrl: true },
          },
          receiver: {
            columns: { fullName: true, avatarUrl: true },
          },
        },
      })
      .then((rows) => {
        return rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        }));
      });

    return feedbacks as RatingWithUsers[];
  }

  async updateFeedback(
    orderId: string,
    userId: string,
    rating: number,
    comment?: string
  ) {
    const existingFeedback = await db.query.ratings.findFirst({
      where: and(eq(ratings.orderId, orderId), eq(ratings.senderId, userId)),
    });

    if (!existingFeedback) {
      throw new NotFoundError("Feedback not found");
    }

    if (!existingFeedback.receiverId) {
      throw new BadRequestError(
        "Cannot update feedback - receiver information is missing"
      );
    }

    // Update rating record
    const [updatedRating] = await db
      .update(ratings)
      .set({
        score: rating,
        comment,
        updatedAt: new Date(),
      })
      .where(
        and(eq(ratings.id, existingFeedback.id), eq(ratings.senderId, userId))
      )
      .returning();

    // Update receiver's rating score
    const receiver = await db.query.users.findFirst({
      where: eq(users.id, existingFeedback.receiverId),
    });

    const ratingDifference = rating - existingFeedback.score;

    if (receiver) {
      const newRatingScore =
        (receiver.ratingScore * receiver.ratingCount + ratingDifference) /
        receiver.ratingCount;

      await db
        .update(users)
        .set({
          ratingScore: newRatingScore,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingFeedback.receiverId));
    }

    return updatedRating;
  }

  async getSellerStats(sellerId: string) {
    // TODO: calculate average rating and count
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  async canRate(orderId: string, raterId: string): Promise<boolean> {
    // TODO: check if user can rate (order delivered, not already rated)
    return false;
  }
}

export const ratingService = new RatingService();
