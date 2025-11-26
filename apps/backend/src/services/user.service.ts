import { db } from "@/config/database";
import { users, watchLists, upgradeRequests } from "@/models";
import { eq, and } from "drizzle-orm";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/errors";

export interface UpdateProfileInput {
  fullName?: string;
  address?: string;
  dateOfBirth?: Date;
}

export class UserService {
  async getById(userId: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!result) throw new NotFoundError("User not found");
    return result;
  }

  async updateProfile(userId: string, updates: UpdateProfileInput) {
    // TODO: validate and update user profile
    await this.getById(userId); // ensure user exists

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async getWatchlist(userId: string) {
    // TODO: get user's watchlist with product details
    return [];
  }

  async addToWatchlist(userId: string, productId: string) {
    // TODO: add product to watchlist, check duplicates
    throw new BadRequestError("Not implemented");
  }

  async removeFromWatchlist(userId: string, productId: string) {
    // TODO: remove from watchlist
    return true;
  }

  async requestUpgradeToSeller(userId: string) {
    // TODO: create upgrade request if not already pending
    const user = await this.getById(userId);

    if (user.role === "SELLER") {
      throw new ConflictError("User is already a seller");
    }

    throw new BadRequestError("Not implemented");
  }

  async getBiddingHistory(userId: string) {
    // TODO: get user's bid history with product details
    return [];
  }

  async getWonAuctions(userId: string) {
    // TODO: get auctions won by user
    return [];
  }
}

export const userService = new UserService();
