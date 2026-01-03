import type {
  MyAutoBid,
  Product,
  GetUsersParams,
  AdminUserListItem,
  AdminUser,
  PaginatedResponse,
  UpdateUserInfoRequest,
} from "@repo/shared-types";
import { eq, and, or, ilike, count, gte } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { supabase, supabaseAdmin } from "@/config/supabase";
import {
  users,
  watchLists,
  upgradeRequests,
  bids,
  products,
  orders,
  autoBids,
} from "@/models";
import { emailService } from "@/services";
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
    const existingUser = await this.getById(userId); // Ensure user exists

    const updates: Record<string, string | Date> = {
      updatedAt: new Date(),
    };

    const changedFields: Array<{
      field: string;
      oldValue: string;
      newValue: string;
    }> = [];

    if (
      data.fullName !== undefined &&
      data.fullName !== existingUser.fullName
    ) {
      updates.fullName = data.fullName;
      changedFields.push({
        field: "Họ và tên",
        oldValue: existingUser.fullName || "Chưa có",
        newValue: data.fullName,
      });
    }

    if (data.address !== undefined && data.address !== existingUser.address) {
      updates.address = data.address;
      changedFields.push({
        field: "Địa chỉ",
        oldValue: existingUser.address || "Chưa có",
        newValue: data.address,
      });
    }

    if (data.birthDate !== undefined) {
      // Convert to string for comparison
      const existingBirthDate = existingUser.birthDate
        ? new Date(existingUser.birthDate).toISOString().split("T")[0]
        : null;
      const newBirthDate = new Date(data.birthDate).toISOString().split("T")[0];
      if (newBirthDate !== existingBirthDate) {
        updates.birthDate = data.birthDate;
        changedFields.push({
          field: "Ngày sinh",
          oldValue: existingBirthDate
            ? new Date(existingBirthDate).toLocaleDateString("vi-VN")
            : "Chưa có",
          newValue: new Date(newBirthDate).toLocaleDateString("vi-VN"),
        });
      }
    }

    // Only update if there are changes
    if (changedFields.length > 0) {
      const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();

      // Send email notification to user
      try {
        emailService.notifyUserInfoUpdated(
          updated.email,
          updated.fullName || updated.username,
          changedFields
        );
      } catch (emailError) {
        // Log email error but don't fail the operation
        logger.warn(
          `Failed to send info update notification email to user ${userId}:`,
          emailError
        );
      }

      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } else {
      // No changes, return existing user
      return {
        ...existingUser,
        createdAt: existingUser.createdAt.toISOString(),
        updatedAt: existingUser.updatedAt.toISOString(),
      };
    }
  }

  async updateAccountStatusAdmin(
    userId: string,
    accountStatus: "PENDING_VERIFICATION" | "ACTIVE" | "BANNED"
  ): Promise<AdminUser> {
    const existingUser = await this.getById(userId); // Ensure user exists
    const oldStatus = existingUser.accountStatus;

    const [updated] = await db
      .update(users)
      .set({
        accountStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Send email notification to user if status changed
    if (oldStatus !== accountStatus) {
      try {
        emailService.notifyAccountStatusChanged(
          updated.email,
          updated.fullName || updated.username,
          oldStatus,
          accountStatus
        );
      } catch (emailError) {
        // Log email error but don't fail the operation
        logger.warn(
          `Failed to send account status change notification email to user ${userId}:`,
          emailError
        );
      }
    }

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async updateUserRoleAdmin(
    userId: string,
    role: "BIDDER" | "SELLER" | "ADMIN"
  ): Promise<AdminUser> {
    const existingUser = await this.getById(userId); // Ensure user exists
    const oldRole = existingUser.role;

    const [updated] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Send email notification to user if role changed
    if (oldRole !== role) {
      try {
        emailService.notifyUserRoleChanged(
          updated.email,
          updated.fullName || updated.username,
          oldRole,
          role
        );
      } catch (emailError) {
        // Log email error but don't fail the operation
        logger.warn(
          `Failed to send role change notification email to user ${userId}:`,
          emailError
        );
      }
    }

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
    const user = await this.getById(userId); // Ensure user exists

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw new BadRequestError(`Failed to reset password: ${error.message}`);
    }

    // Send email notification to user
    try {
      emailService.notifyUserPasswordReset(
        user.email,
        user.fullName || user.username,
        newPassword
      );
    } catch (emailError) {
      // Log email error but don't fail the operation
      logger.warn(
        `Failed to send password reset notification email to user ${userId}:`,
        emailError
      );
    }
  }

  async toggleBanUserAdmin(
    userId: string,
    isBanned: boolean,
    reason?: string,
    _duration?: number
  ): Promise<AdminUser> {
    await this.getById(userId); // Ensure user exists

    if (isBanned && !reason) {
      throw new BadRequestError("Reason is required when banning a user");
    }

    // Validate business rules before banning (same as deletion)
    if (isBanned) {
      await this.validateUserBusinessRules(userId);
    }

    const newStatus = isBanned ? "BANNED" : "ACTIVE";

    await db.transaction(async (tx) => {
      // Update user status
      const [updated] = await tx
        .update(users)
        .set({
          accountStatus: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // Handle auto-bids based on ban status
      if (isBanned) {
        // Disable all active auto-bids when banning user
        await tx
          .update(autoBids)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(and(eq(autoBids.userId, userId), eq(autoBids.isActive, true)));

        // Invalidate all VALID bids when banning user
        await tx
          .update(bids)
          .set({
            status: "INVALID",
          })
          .where(and(eq(bids.userId, userId), eq(bids.status, "VALID")));
      } else {
        // Re-enable auto-bids when unbanning user (optional - depends on business logic)
        // For now, we keep them disabled to prevent immediate reactivation
        // Admin can manually re-enable specific auto-bids if needed
        // Note: We don't automatically re-validate bids when unbanning
        // Admin should manually review and re-validate bids if appropriate
      }

      return updated;
    });

    // Get the updated user data
    const [updated] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Send email notification to user
    try {
      if (isBanned) {
        emailService.notifyUserBanned(
          updated.email,
          updated.fullName || updated.username,
          reason || "Không có lý do cụ thể"
        );
      } else {
        emailService.notifyUserUnbanned(
          updated.email,
          updated.fullName || updated.username
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the operation
      logger.warn(
        `Failed to send ban/unban notification email to user ${userId}:`,
        emailError
      );
    }

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async createUserAdmin(data: {
    email: string;
    username: string;
    fullName: string;
    password: string;
    role?: "BIDDER" | "SELLER" | "ADMIN";
    address?: string;
    birthDate?: string;
  }): Promise<AdminUser> {
    const existingEmailUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingEmailUser) {
      throw new ConflictError("Email already exists");
    }

    const existingUsernameUser = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    });

    if (existingUsernameUser) {
      throw new ConflictError("Username already exists");
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          username: data.username,
          full_name: data.fullName,
        },
      });

    if (authError || !authData.user) {
      throw new BadRequestError(
        `Failed to create user in auth: ${authError?.message || "Unknown error"}`
      );
    }

    const [newUser] = await db
      .insert(users)
      .values({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        role: data.role || "BIDDER",
        accountStatus: "ACTIVE",
        address: data.address || null,
        birthDate: data.birthDate || null,
      })
      .returning();

    // Send email notification to new user
    try {
      emailService.notifyUserCreated(
        newUser.email,
        newUser.fullName || newUser.username,
        data.password,
        newUser.role
      );
    } catch (emailError) {
      // Log email error but don't fail the operation
      logger.warn(
        `Failed to send account creation notification email to user ${newUser.id}:`,
        emailError
      );
    }

    return {
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };
  }

  async deleteUserAdmin(userId: string, reason?: string): Promise<void> {
    const user = await this.getById(userId); // Get user info before deletion for email

    // Validate business rules before deletion
    await this.validateUserBusinessRules(userId);

    // ========================================
    // SET NULL DELETION (Keep orders for statistics)
    // ========================================

    // Nếu pass hết các ràng buộc nghiệp vụ, thực hiện delete với set null strategy
    // Database foreign keys với onDelete: "set null" sẽ giữ lại orders:
    // - orders.productId = NULL (nếu product bị xóa cascade)
    // - orders.winnerId = NULL (khi xóa winner)
    // - orders.sellerId = NULL (khi xóa seller)
    // → Orders vẫn giữ: orderNumber, finalPrice, totalAmount, status, timestamps

    // Database foreign keys với onDelete: "cascade" sẽ xóa:
    // - products (và cascade tiếp: productImages, productUpdates, watchLists, bids, autoBids, ratings, chatMessages, productQuestions)
    // - ratings (as sender/receiver)
    // - chatMessages (as sender/receiver)
    // - productQuestions
    // - bids, autoBids

    let deletedUser;
    await db.transaction(async (tx) => {
      // Xóa user khỏi database
      // Cascade sẽ tự động xử lý tất cả related records
      const result = await tx
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

      deletedUser = result[0];
    });

    // Kiểm tra xem có thật sự xóa được không
    if (!deletedUser) {
      throw new BadRequestError(
        "Failed to delete user from database. User may not exist or deletion was blocked."
      );
    }

    // Send email notification to user before deleting from auth
    try {
      emailService.notifyUserDeleted(
        user.email,
        user.fullName || user.username,
        reason || "Không có lý do cụ thể"
      );
    } catch (emailError) {
      // Log email error but don't fail the operation
      logger.warn(
        `Failed to send deletion notification email to user ${userId}:`,
        emailError
      );
    }

    // Chỉ khi xóa database thành công, mới xóa user khỏi auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      // Log error nhưng không throw vì data đã được xóa khỏi database
      // User có thể cleanup auth account thủ công nếu cần
      logger.warn(
        `User ${userId} deleted from database but failed to delete from auth: ${authError.message}`
      );
    }
  }

  /**
   * Validates business rules before performing restrictive actions on a user (delete/ban).
   * This ensures that users cannot be deleted or banned if they have active business obligations.
   */
  private async validateUserBusinessRules(userId: string): Promise<void> {
    const user = await this.getById(userId);
    const now = new Date();

    // ========================================
    // BUSINESS LOGIC CHECKS (Pre-action validation)
    // ========================================

    // Kiểm tra ràng buộc cho Người bán (SELLER hoặc ADMIN có thể có products)
    if (user.role === "SELLER" || user.role === "ADMIN") {
      // Check 1: Sản phẩm đang còn hạn đấu giá (status = ACTIVE và endTime > now)
      const activeProducts = await db.query.products.findFirst({
        where: and(
          eq(products.sellerId, userId),
          eq(products.status, "ACTIVE"),
          gte(products.endTime, now)
        ),
      });

      if (activeProducts) {
        throw new BadRequestError(
          "Không thể thực hiện hành động này với người bán đang có sản phẩm trong thời gian đấu giá. Vui lòng đợi đến khi các phiên đấu giá kết thúc."
        );
      }

      // Check 2: Đơn hàng chưa hoàn tất (chưa COMPLETED hoặc CANCELLED)
      // Note: Chỉ check orders mà user vẫn còn là seller (chưa bị set null)
      const pendingOrdersAsSeller = await db.query.orders.findFirst({
        where: and(
          eq(orders.sellerId, userId),
          or(
            eq(orders.status, "PENDING"),
            eq(orders.status, "PAID"),
            eq(orders.status, "SHIPPED")
          )
        ),
      });

      if (pendingOrdersAsSeller) {
        throw new BadRequestError(
          "Không thể thực hiện hành động này với người bán đang có đơn hàng chưa hoàn tất. Vui lòng hoàn tất tất cả đơn hàng trước."
        );
      }
    }

    // Kiểm tra ràng buộc cho Người mua (BIDDER hoặc ADMIN có thể đấu giá)
    if (user.role === "BIDDER" || user.role === "ADMIN") {
      // Check 1: Có đang giữ giá cao nhất ở sản phẩm nào không
      // Phải kiểm tra TẤT CẢ các sản phẩm đang active
      const activeProducts = await db.query.products.findMany({
        where: and(eq(products.status, "ACTIVE"), gte(products.endTime, now)),
        with: {
          bids: {
            where: eq(bids.userId, userId),
            orderBy: (bids, { desc }) => [desc(bids.amount)],
            limit: 1,
          },
        },
      });

      // Kiểm tra từng sản phẩm xem user có đang giữ giá cao nhất không
      for (const product of activeProducts) {
        if (product.bids.length > 0) {
          const userBidAmount = product.bids[0].amount;
          const currentPrice = product.currentPrice;

          if (currentPrice && userBidAmount === currentPrice) {
            throw new BadRequestError(
              `Không thể thực hiện hành động này với người mua đang giữ giá cao nhất trong phiên đấu giá "${product.name}". Vui lòng đợi đến khi phiên đấu giá kết thúc hoặc có người đấu giá cao hơn.`
            );
          }
        }
      }

      // Check 2: Đơn hàng đang chờ xác nhận (as winner)
      // Note: Chỉ check orders mà user vẫn còn là winner (chưa bị set null)
      const pendingOrdersAsWinner = await db.query.orders.findFirst({
        where: and(
          eq(orders.winnerId, userId),
          or(
            eq(orders.status, "PENDING"),
            eq(orders.status, "PAID"),
            eq(orders.status, "SHIPPED")
          )
        ),
      });

      if (pendingOrdersAsWinner) {
        throw new BadRequestError(
          "Không thể thực hiện hành động này với người mua đang có đơn hàng chờ xác nhận. Vui lòng hoàn tất tất cả đơn hàng trước."
        );
      }
    }
  }
}

export const userService = new UserService();
