import type { Product } from "@repo/shared-types";
import { eq, and } from "drizzle-orm";

import { db } from "@/config/database";
import { supabase } from "@/config/supabase";
import { users, watchLists, upgradeRequests, bids, products } from "@/models";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/errors";

export class UserService {
  async getById(userId: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!result) throw new NotFoundError("User");

    return result;
  }

  async updateProfile(
    userId: string,
    fullName: string | null,
    address: string | null,
    avatarUrl: string | null
  ) {
    const existingUser = await this.getById(userId); // ensure user exists

    const updates = {
      fullName: fullName || existingUser.fullName,
      address: address || existingUser.address,
      avatarUrl: avatarUrl || existingUser.avatarUrl,
    };

    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async getWatchlist(userId: string) {
    const existingUser = await this.getById(userId); // ensure user exists

    const items = await db.query.watchLists.findMany({
      where: eq(watchLists.userId, existingUser.id),
      with: { product: true },
    });

    const products: Product[] = items.map((item) => ({
      ...item.product,
      buyNowPrice: item.product.buyNowPrice ?? null,
      currentPrice: item.product.currentPrice ?? null,
    }));

    return products;
  }

  async checkInWatchlist(userId: string, productId: string) {
    const existingUser = await this.getById(userId); // ensure user exists

    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!existingProduct) {
      throw new NotFoundError("Product");
    }

    const item = await db.query.watchLists.findFirst({
      where: and(
        eq(watchLists.userId, existingUser.id),
        eq(watchLists.productId, existingProduct.id)
      ),
    });

    return item !== undefined;
  }

  async addToWatchlist(userId: string, productId: string) {
    const exists = await this.checkInWatchlist(userId, productId);

    if (exists) {
      throw new ConflictError("Product already in watchlist");
    }

    await db.insert(watchLists).values({
      userId,
      productId,
    });

    return { message: "Product added to watchlist" };
  }

  async removeFromWatchlist(userId: string, productId: string) {
    const exists = await this.checkInWatchlist(userId, productId);

    if (!exists) {
      throw new NotFoundError("Product not in watchlist");
    }

    await db
      .delete(watchLists)
      .where(
        and(eq(watchLists.userId, userId), eq(watchLists.productId, productId))
      );

    return { message: "Product removed from watchlist" };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.getById(userId); // ensure user exists

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (error) {
      throw new BadRequestError("Current password is incorrect");
    }

    const { error: updatedError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updatedError) {
      throw new BadRequestError(updatedError.message);
    }

    return { message: "Password updated successfully" };
  }

  async requestUpgradeToSeller(userId: string, reason: string) {
    const user = await this.getById(userId);

    if (user.role === "SELLER") {
      throw new ConflictError("User is already a seller");
    }

    const pending = await db.query.upgradeRequests.findFirst({
      where: and(
        eq(upgradeRequests.userId, userId),
        eq(upgradeRequests.status, "PENDING")
      ),
    });

    if (pending) {
      throw new ConflictError("Upgrade request already pending");
    }

    const [request] = await db
      .insert(upgradeRequests)
      .values({
        userId,
        reason,
        status: "PENDING",
      })
      .returning();

    return request;
  }

  async getBiddingHistory(userId: string) {
    const existingUser = await this.getById(userId); // ensure user exists

    const bidHistory = await db.query.bids.findMany({
      where: eq(bids.userId, existingUser.id),
    });

    return bidHistory.map((item) => item);
  }

  async getWonAuctions(userId: string) {
    // TODO: get auctions won by user
    return [];
  }
}

export const userService = new UserService();
