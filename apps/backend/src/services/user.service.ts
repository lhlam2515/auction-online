import { db } from "@/config/database";
import { users, watchLists, upgradeRequests } from "@/models";
import { eq, and } from "drizzle-orm";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/errors";

export class UserService {
  async getById(userId: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!result) throw new NotFoundError("User not found");
    return result;
  }

  async updateProfile(
    userId: string,
    fullName?: string,
    address?: string,
    avatarUrl?: string
  ) {
    // TODO: validate and update user profile
    await this.getById(userId); // ensure user exists

    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (address !== undefined) updates.address = address;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // TODO: validate current password and update with new password
    await this.getById(userId); // ensure user exists

    // TODO: verify current password
    // TODO: hash new password
    // TODO: update password in database
    throw new BadRequestError("Not implemented");
  }

  async requestUpgradeToSeller(userId: string, reason: string) {
    // TODO: create upgrade request if not already pending
    const user = await this.getById(userId);

    if (user.role === "SELLER") {
      throw new ConflictError("User is already a seller");
    }

    // TODO: create upgrade request with reason
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
