import type { Rating, RatingScore, RatingWithUsers } from "@repo/shared-types";
import { eq, and, or, sql, count } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, ratings, users } from "@/models";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";

type DbTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

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
  ): Promise<Rating> {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: { id: true, winnerId: true, sellerId: true, status: true },
      });

      if (!order) {
        throw new NotFoundError("Không tìm thấy đơn hàng");
      }

      // Validate dữ liệu
      if (!order.winnerId || !order.sellerId) {
        throw new BadRequestError(
          "Không thể để lại đánh giá - thiếu thông tin người nhận"
        );
      }

      if (order.winnerId !== userId && order.sellerId !== userId) {
        throw new ForbiddenError(
          "Bạn không có quyền để lại đánh giá cho đơn hàng này"
        );
      }

      if (order.status !== "COMPLETED" && order.status !== "CANCELLED") {
        throw new BadRequestError(
          "Chỉ có thể để lại đánh giá cho đơn hàng đã hoàn thành hoặc đã hủy"
        );
      }

      const receiverId =
        order.winnerId === userId ? order.sellerId : order.winnerId;

      // Kiểm tra feedback đã tồn tại chưa
      const existingFeedback = await tx.query.ratings.findFirst({
        where: and(eq(ratings.orderId, order.id), eq(ratings.senderId, userId)),
      });

      if (existingFeedback) {
        throw new BadRequestError(
          "Bạn đã để lại đánh giá cho đơn hàng này rồi"
        );
      }

      const [newRating] = await tx
        .insert(ratings)
        .values({
          orderId: order.id,
          senderId: userId,
          receiverId,
          score: rating,
          comment: comment || null,
        })
        .returning();

      // Cập nhật lại thống kê đánh giá cho người nhận
      await this.refreshUserRatingStats(receiverId, tx);

      return {
        ...newRating,
        score: newRating.score as RatingScore,
        createdAt: newRating.createdAt.toISOString(),
        updatedAt: newRating.updatedAt.toISOString(),
      };
    });
  }

  async getByOrder(
    orderId: string,
    userId: string
  ): Promise<RatingWithUsers[]> {
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        or(eq(orders.winnerId, userId), eq(orders.sellerId, userId))
      ),
    });

    if (!order) {
      throw new NotFoundError(
        "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập"
      );
    }

    const feedbacks = await db.query.ratings.findMany({
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
    });

    return feedbacks.map((row) => ({
      ...row,
      score: row.score as RatingScore,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async updateFeedback(
    orderId: string,
    userId: string,
    rating: RatingScore,
    comment?: string
  ): Promise<Rating> {
    return await db.transaction(async (tx) => {
      const existingFeedback = await tx.query.ratings.findFirst({
        where: and(eq(ratings.orderId, orderId), eq(ratings.senderId, userId)),
      });

      if (!existingFeedback) {
        throw new NotFoundError("Không tìm thấy đánh giá để cập nhật");
      }

      const [updatedRating] = await tx
        .update(ratings)
        .set({
          score: rating,
          comment,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, existingFeedback.id))
        .returning();

      // Cập nhật lại thống kê đánh giá cho người nhận
      await this.refreshUserRatingStats(existingFeedback.receiverId, tx);

      return {
        ...updatedRating,
        score: updatedRating.score as RatingScore,
        createdAt: updatedRating.createdAt.toISOString(),
        updatedAt: updatedRating.updatedAt.toISOString(),
      };
    });
  }

  private async refreshUserRatingStats(userId: string, tx: DbTransaction) {
    const [stats] = await tx
      .select({
        count: sql<number>`cast(count(${ratings.id}) as int)`,
        avgScore: sql<number>`avg(${ratings.score})`,
      })
      .from(ratings)
      .where(eq(ratings.receiverId, userId));

    const { count = 0, avgScore = 0 } = stats;

    await tx
      .update(users)
      .set({
        ratingCount: count,
        ratingScore: avgScore,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}

export const ratingService = new RatingService();
