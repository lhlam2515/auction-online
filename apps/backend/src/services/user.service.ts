import type {
  MyAutoBid,
  Product,
  GetUsersParams,
  AdminUserListItem,
  AdminUser,
  PaginatedResponse,
  UpdateUserInfoRequest,
  User,
} from "@repo/shared-types";
import { eq, and, or, ilike, count, gte, desc, asc, sql } from "drizzle-orm";
import type { PostgresError } from "postgres";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { getCloneClient, supabaseAdmin } from "@/config/supabase";
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
  async getById(userId: string): Promise<User> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!result) throw new NotFoundError("Không tìm thấy người dùng");

    return {
      ...result,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  async updateProfile(
    userId: string,
    fullName: string | null,
    address?: string | null,
    birthDate?: string | null,
    avatarUrl?: string | null
  ): Promise<User> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        fullName: true,
        address: true,
        birthDate: true,
        avatarUrl: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    const updates = {
      fullName: fullName || existingUser.fullName,
      address: address || existingUser.address,
      birthDate: birthDate || existingUser.birthDate,
      avatarUrl: avatarUrl || existingUser.avatarUrl,
    };

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async getWatchlist(userId: string): Promise<Product[]> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

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
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true },
    });

    if (!existingProduct) {
      throw new NotFoundError("Không tìm thấy sản phẩm");
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
    try {
      await db.insert(watchLists).values({
        userId,
        productId,
        createdAt: new Date(),
      });

      return { inWatchlist: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const err = error?.cause ? (error.cause as PostgresError) : error;
      if (err.code === "23505") {
        // Unique violation
        throw new ConflictError("Sản phẩm đã có trong danh sách yêu thích");
      }

      logger.error("Error adding to watchlist:", error);
      throw new BadRequestError(
        "Không thể thêm sản phẩm vào danh sách yêu thích"
      );
    }
  }

  async removeFromWatchlist(userId: string, productId: string) {
    return await db.transaction(async (tx) => {
      const deleted = await tx
        .delete(watchLists)
        .where(
          and(
            eq(watchLists.userId, userId),
            eq(watchLists.productId, productId)
          )
        )
        .returning();

      if (deleted.length === 0) {
        throw new NotFoundError("Sản phẩm không có trong danh sách yêu thích");
      }

      return { inWatchlist: false };
    });
  }

  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ) {
    const supabaseClient = getCloneClient();

    const { error: signInError } = await supabaseClient.auth.signInWithPassword(
      {
        email,
        password: currentPassword,
      }
    );

    if (signInError) {
      throw new BadRequestError(
        "Không tìm thấy người dùng hoặc mật khẩu không đúng"
      );
    }

    const userProfile = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (!userProfile) {
      // Trường hợp hy hữu: user tồn tại trong auth nhưng không có trong database
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    const { error: updatedError } =
      await supabaseAdmin.auth.admin.updateUserById(userProfile.id, {
        password: newPassword,
      });

    if (updatedError) {
      logger.error(
        `Error changing password for user ${userProfile.id}:`,
        updatedError
      );
      throw new BadRequestError(
        "Đổi mật khẩu không thành công. Vui lòng thử lại sau."
      );
    }

    return { message: "Đổi mật khẩu thành công" };
  }

  async requestUpgradeToSeller(userId: string, reason: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

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
      throw new ConflictError("Yêu cầu nâng cấp đang chờ xử lý");
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

  async getBiddingHistory(userId: string): Promise<MyAutoBid[]> {
    const bidHistory = await db.query.autoBids.findMany({
      where: eq(bids.userId, userId),
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
              where: (images, { eq }) => eq(images.isMain, true),
              columns: { imageUrl: true },
              limit: 1,
            },
          },
        },
      },
      orderBy: [desc(autoBids.updatedAt)],
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
    }));
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

    if (role) conditions.push(eq(users.role, role));
    if (accountStatus) conditions.push(eq(users.accountStatus, accountStatus));

    // Full text search using PostgreSQL's built-in FTS
    if (q?.trim()) {
      const searchTerm = q.trim();
      conditions.push(
        sql`to_tsvector('simple', ${users.fullName} || ' ' || ${users.email} || ' ' || ${users.username}) @@ websearch_to_tsquery('simple', ${searchTerm})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumnMap = {
      createdAt: users.createdAt,
      fullName: users.fullName,
      email: users.email,
      ratingScore: users.ratingScore,
    };

    const sortColumn = sortColumnMap[sortBy] || users.createdAt;
    const orderExpr = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    const [userList, totalCountResult] = await Promise.all([
      db.query.users.findMany({
        where: whereClause,
        orderBy: [orderExpr],
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
      throw new NotFoundError("Không tìm thấy người dùng");
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

    const checkChange = (
      field: string,
      oldVal: unknown,
      newVal: unknown,
      label: string
    ) => {
      if (newVal !== undefined && newVal !== oldVal) {
        updates[field] = newVal as string | Date;
        changedFields.push({
          field: label,
          oldValue: oldVal ? String(oldVal) : "Chưa có",
          newValue: String(newVal),
        });
        return true;
      }
      return false;
    };

    checkChange("fullName", existingUser.fullName, data.fullName, "Họ và tên");
    checkChange("address", existingUser.address, data.address, "Địa chỉ");

    if (data.birthDate !== undefined) {
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
      return existingUser;
    }
  }

  async updateAccountStatusAdmin(
    userId: string,
    accountStatus: "PENDING_VERIFICATION" | "ACTIVE" | "BANNED"
  ): Promise<AdminUser> {
    if (accountStatus === "BANNED") {
      return this.toggleBanUserAdmin(
        userId,
        true,
        "Bị admin thay đổi trạng thái tài khoản"
      );
    }

    if (accountStatus === "ACTIVE") {
      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { accountStatus: true },
      });
      if (currentUser && currentUser.accountStatus === "BANNED") {
        return this.toggleBanUserAdmin(userId, false);
      }
    }

    const existingUser = await this.getById(userId); // Ensure user exists
    const oldStatus = existingUser.accountStatus;

    if (oldStatus === accountStatus) {
      return existingUser;
    }

    const [updated] = await db
      .update(users)
      .set({
        accountStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    try {
      await emailService.notifyAccountStatusChanged(
        updated.email,
        updated.fullName || updated.username,
        oldStatus,
        accountStatus
      );
    } catch (error) {
      // Log email error but don't fail the operation
      logger.error("Send account status change email failed:", error);
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

    if (oldRole === role) {
      return existingUser;
    }

    const [updated] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    try {
      emailService.notifyUserRoleChanged(
        updated.email,
        updated.fullName || updated.username,
        oldRole,
        role
      );
    } catch (emailError) {
      // Log email error but don't fail the operation
      logger.warn("Send role change notification email failed:", emailError);
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
  ): Promise<{ message: string }> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true, fullName: true, username: true },
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      logger.error(`Error resetting password for user ${userId}:`, error);
      throw new BadRequestError(
        "Đặt lại mật khẩu không thành công. Vui lòng thử lại sau."
      );
    }

    // Send email notification to user
    try {
      emailService.notifyUserPasswordReset(
        user.email,
        user.fullName || user.username,
        newPassword
      );
    } catch (error) {
      // Log email error but don't fail the operation
      logger.warn("Send password reset notification email failed:", error);
    }

    return { message: "Đặt lại mật khẩu thành công" };
  }

  async toggleBanUserAdmin(
    userId: string,
    isBanned: boolean,
    reason?: string,
    _duration?: number
  ): Promise<AdminUser> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, accountStatus: true },
    });

    if (!existingUser) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    if (isBanned && !reason) {
      throw new BadRequestError("Không thể ban người dùng mà không có lý do");
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
        await emailService.notifyUserBanned(
          updated.email,
          updated.fullName || updated.username,
          reason || "Không có lý do cụ thể"
        );
      } else {
        await emailService.notifyUserUnbanned(
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
    let supabaseUserId: string | null = null;

    try {
      const existingUsers = await db.query.users.findMany({
        where: or(
          eq(users.email, data.email),
          eq(users.username, data.username)
        ),
        columns: { id: true, email: true, username: true },
      });

      if (existingUsers.length > 0) {
        const emailExists = existingUsers.some(
          (user) => user.email === data.email
        );
        const usernameExists = existingUsers.some(
          (user) => user.username === data.username
        );

        if (emailExists) {
          throw new ConflictError("Email này đã được sử dụng");
        }

        if (usernameExists) {
          throw new ConflictError("Username này đã được sử dụng");
        }
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
        logger.error("Error creating user in auth:", authError);
        throw new BadRequestError(
          `Tạo người dùng không thành công. Vui lòng thử lại sau.`
        );
      }
      supabaseUserId = authData.user.id; // Lưu ID để rollback

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
    } catch (error) {
      // Rollback: Xóa user Supabase nếu DB insert thất bại
      if (supabaseUserId) {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
      }

      if (error instanceof ConflictError || error instanceof BadRequestError)
        throw error;

      logger.error("Create User Admin Error:", error);
      throw new BadRequestError(
        "Tạo người dùng thất bại. Vui lòng thử lại sau."
      );
    }
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
    // - ratings (as sender)
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
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

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
      const highBids = await db
        .select({ id: products.id })
        .from(bids)
        .innerJoin(products, eq(bids.productId, products.id))
        .where(
          and(
            eq(bids.userId, userId),
            eq(bids.status, "VALID"),
            eq(products.status, "ACTIVE"),
            gte(products.endTime, now),
            // Điều kiện quan trọng: Bid của user chính là giá hiện tại của sản phẩm
            eq(bids.amount, products.currentPrice)
          )
        )
        .limit(1);

      if (highBids.length > 0) {
        throw new BadRequestError(
          "Không thể thực hiện hành động này với người mua đang giữ giá cao nhất ở một hoặc nhiều sản phẩm."
        );
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
