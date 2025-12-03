import { db } from "@/config/database";
import { ratings } from "@/models";
import { eq, and, avg } from "drizzle-orm";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/errors";

export class RatingService {
  async create(
    orderId: string,
    raterId: string,
    targetUserId: string,
    rating: number,
    ratingType: string,
    comment?: string
  ) {
    // TODO: validate order exists, buyer rated seller, no duplicate
    if (rating < 1 || rating > 5) {
      throw new BadRequestError("Rating score must be between 1 and 5");
    }

    return await db.transaction(async (tx) => {
      // check for existing rating
      // insert rating
      // update seller's average rating
      throw new BadRequestError("Not implemented");
    });
  }

  async getBySeller(sellerId: string) {
    // TODO: get all ratings for a seller with pagination
    return [];
  }

  async getByOrder(orderId: string) {
    // TODO: get rating for specific order
    return null;
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
