import type {
  MyAutoBid,
  Product,
  GetUsersParams,
  AdminUserListItem,
  AdminUser,
  PaginatedResponse,
  UpdateUserInfoRequest,
} from "@repo/shared-types";
import { eq, and, or, ilike, count } from "drizzle-orm";

import { db } from "@/config/database";
import { supabase, supabaseAdmin } from "@/config/supabase";
import { users, watchLists, upgradeRequests, bids, products } from "@/models";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";

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
    address?: string | null,
    birthDate?: string | null,
    avatarUrl?: string | null
  ) {
    const existingUser = await this.getById(userId); // ensure user exists

    const updates = {
      fullName: fullName || existingUser.fullName,
      address: address || existingUser.address,
      birthDate: birthDate || existingUser.birthDate,
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

    return { inWatchlist: true };
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

    return { inWatchlist: false };
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
    const existingUser = await this.getById(userId);

    const bidHistory = await db.query.autoBids.findMany({
      where: eq(bids.userId, existingUser.id),
      with: {
        product: {
          columns: {
            name: true,
            currentPrice: true,
            endTime: true,
            winnerId: true,
          },
          with: {
            images: {
              columns: {
                imageUrl: true,
              },
              where: (images, { eq }) => eq(images.isMain, true),
              limit: 1,
            },
          },
        },
      },
      orderBy: (bid, { desc }) => [desc(bid.createdAt)],
    });

    return bidHistory.map((item) => ({
      ...item,
      product: {
        name: item.product.name,
        currentPrice: item.product.currentPrice,
        endTime: item.product.endTime,
        winnerId: item.product.winnerId,
        imageUrl: item.product.images[0]?.imageUrl || null,
      },
    })) as MyAutoBid[];
  }

  async getAllUsersAdmin(
    params: GetUsersParams
  ): Promise<PaginatedResponse<AdminUserListItem>> {
    const {
      page = 1,
      limit = 20,
      role,
      accountStatus,
      q,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (accountStatus) {
      conditions.push(eq(users.accountStatus, accountStatus));
    }

    if (q) {
      conditions.push(
        or(
          ilike(users.fullName, `%${q}%`),
          ilike(users.email, `%${q}%`),
          ilike(users.username, `%${q}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [userList, totalCountResult] = await Promise.all([
      db.query.users.findMany({
        where: whereClause,
        orderBy: (user, { desc, asc }) => {
          const sortColumn = {
            createdAt: user.createdAt,
            fullName: user.fullName,
            email: user.email,
            ratingScore: user.ratingScore,
          }[sortBy];
          return [sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn)];
        },
        limit,
        offset,
      }),
      db.select({ count: count() }).from(users).where(whereClause),
    ]);

    const total = totalCountResult[0]?.count || 0;

    return toPaginated<AdminUserListItem>(
      userList.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        accountStatus: user.accountStatus,
        ratingScore: user.ratingScore,
        ratingCount: user.ratingCount,
        createdAt: user.createdAt.toISOString(),
      })),
      page,
      limit,
      total
    );
  }

  async getUserByIdAdmin(userId: string): Promise<AdminUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateUserInfoAdmin(
    userId: string,
    data: UpdateUserInfoRequest
  ): Promise<AdminUser> {
    await this.getById(userId); // Ensure user exists

    const updates: Record<string, string | Date> = {
      updatedAt: new Date(),
    };

    if (data.fullName !== undefined) {
      updates.fullName = data.fullName;
    }

    if (data.address !== undefined) {
      updates.address = data.address;
    }

    if (data.birthDate !== undefined) {
      updates.birthDate = data.birthDate;
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async updateAccountStatusAdmin(
    userId: string,
    accountStatus: "PENDING_VERIFICATION" | "ACTIVE" | "BANNED"
  ): Promise<AdminUser> {
    await this.getById(userId); // Ensure user exists

    const [updated] = await db
      .update(users)
      .set({
        accountStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async resetUserPasswordAdmin(
    userId: string,
    newPassword: string
  ): Promise<void> {
    await this.getById(userId); // Ensure user exists

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw new BadRequestError(`Failed to reset password: ${error.message}`);
    }
  }
}

export const userService = new UserService();
