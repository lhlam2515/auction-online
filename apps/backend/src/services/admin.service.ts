import type {
  AdminStats,
  OrderStatus,
  PaymentStatus,
  UpgradeRequestStatus,
  AdminAnalytics,
  GetUpgradeRequestsParams,
  PaginatedResponse,
  AdminUpgradeRequest,
  AuctionSettings,
} from "@repo/shared-types";
import { count, eq, sum, and, inArray, desc, ilike, or } from "drizzle-orm";

import { db } from "@/config/database";
import {
  users,
  upgradeRequests,
  products,
  orders,
  orderPayments,
  categories,
  bids,
  auctionSettings,
} from "@/models";

import { adminAnalyticsService } from "./admin-analytics.service";

export class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);

    const [totalActiveAuctionsResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.status, "ACTIVE"));

    const [totalPendingUpgradesResult] = await db
      .select({ count: count() })
      .from(upgradeRequests)
      .where(eq(upgradeRequests.status, "PENDING" as UpgradeRequestStatus));

    // Calculate total transaction value (GMV) from completed paid orders
    const paidOrderIds = await db
      .select({ orderId: orderPayments.orderId })
      .from(orderPayments)
      .where(eq(orderPayments.status, "SUCCESS" as PaymentStatus));

    let totalTransactionValue = 0;
    if (paidOrderIds.length > 0) {
      const orderIdsArray = paidOrderIds.map((o) => o.orderId);
      const [totalTransactionValueResult] = await db
        .select({ sum: sum(orders.totalAmount) })
        .from(orders)
        .where(
          and(
            eq(orders.status, "COMPLETED" as OrderStatus),
            inArray(orders.id, orderIdsArray)
          )
        );
      totalTransactionValue = Number(totalTransactionValueResult.sum ?? 0);
    }

    return {
      totalUsers: totalUsersResult?.count ?? 0,
      totalActiveAuctions: totalActiveAuctionsResult?.count ?? 0,
      totalPendingUpgrades: totalPendingUpgradesResult?.count ?? 0,
      totalTransactionValue,
    };
  }

  /**
   * Get full analytics data
   */
  async getFullAnalytics(): Promise<AdminAnalytics> {
    const [categoryInsights, auctionHealth, operations, engagement] =
      await Promise.all([
        adminAnalyticsService.getCategoryInsights(),
        adminAnalyticsService.getAuctionHealth(),
        adminAnalyticsService.getOperationsMetrics(),
        adminAnalyticsService.getEngagementMetrics(),
      ]);

    return {
      categoryInsights,
      auctionHealth,
      operations,
      engagement,
    };
  }

  /**
   * Get upgrade requests with pagination and filtering
   */
  async getUpgradeRequests(
    params: GetUpgradeRequestsParams
  ): Promise<PaginatedResponse<AdminUpgradeRequest>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.status) {
      conditions.push(eq(upgradeRequests.status, params.status));
    }

    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          ilike(users.username, searchTerm),
          ilike(users.email, searchTerm),
          ilike(users.fullName, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(upgradeRequests)
      .leftJoin(users, eq(upgradeRequests.userId, users.id))
      .where(whereClause);

    const total = totalResult?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Get items
    const items = await db
      .select({
        id: upgradeRequests.id,
        userId: upgradeRequests.userId,
        userName: users.fullName,
        userEmail: users.email,
        reason: upgradeRequests.reason,
        status: upgradeRequests.status,
        processedBy: upgradeRequests.processedBy,
        createdAt: upgradeRequests.createdAt,
        processedAt: upgradeRequests.processedAt,
        adminNote: upgradeRequests.adminNote,
      })
      .from(upgradeRequests)
      .leftJoin(users, eq(upgradeRequests.userId, users.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(upgradeRequests.createdAt));

    // Fetch processor names if needed
    const processedByIds = items
      .map((item) => item.processedBy)
      .filter((id): id is string => !!id);

    let processorMap = new Map<string, string>();
    if (processedByIds.length > 0) {
      const processors = await db
        .select({ id: users.id, name: users.fullName })
        .from(users)
        .where(inArray(users.id, processedByIds));
      processorMap = new Map(processors.map((p) => [p.id, p.name]));
    }

    const formattedItems: AdminUpgradeRequest[] = items.map((item) => ({
      ...item,
      userName: item.userName || "Unknown",
      userEmail: item.userEmail || "Unknown",
      reason: item.reason || undefined,
      adminNote: item.adminNote || undefined,
      processedBy: item.processedBy || undefined,
      createdAt: item.createdAt.toISOString(),
      processedAt: item.processedAt?.toISOString(),
      processedByName: item.processedBy
        ? processorMap.get(item.processedBy)
        : undefined,
    }));

    return {
      items: formattedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Approve upgrade request
   */
  async approveUpgradeRequest(
    id: string,
    adminId: string,
    adminNote?: string
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Get request
      const [request] = await tx
        .select()
        .from(upgradeRequests)
        .where(eq(upgradeRequests.id, id));

      if (!request) {
        throw new Error("Upgrade request not found");
      }

      if (request.status !== "PENDING") {
        throw new Error("Request is already processed");
      }

      // Update request status
      await tx
        .update(upgradeRequests)
        .set({
          status: "APPROVED",
          processedBy: adminId,
          processedAt: new Date(),
          adminNote: adminNote,
        })
        .where(eq(upgradeRequests.id, id));

      // Update user role and seller expiry
      const sellerExpireDate = new Date();
      sellerExpireDate.setDate(sellerExpireDate.getDate() + 7); // Default 7 days trial or subscription

      await tx
        .update(users)
        .set({
          role: "SELLER",
          sellerExpireDate,
        })
        .where(eq(users.id, request.userId));
    });
  }

  /**
   * Reject upgrade request
   */
  async rejectUpgradeRequest(
    id: string,
    adminId: string,
    reason?: string
  ): Promise<void> {
    const [request] = await db
      .select()
      .from(upgradeRequests)
      .where(eq(upgradeRequests.id, id));

    if (!request) {
      throw new Error("Upgrade request not found");
    }

    if (request.status !== "PENDING") {
      throw new Error("Request is already processed");
    }

    await db
      .update(upgradeRequests)
      .set({
        status: "REJECTED",
        processedBy: adminId,
        processedAt: new Date(),
        adminNote: reason,
      })
      .where(eq(upgradeRequests.id, id));
  }

  async updateAuctionSettings(data: {
    extendThresholdMinutes: number;
    extendDurationMinutes: number;
  }): Promise<AuctionSettings> {
    // Check if settings exist
    const existingSettings = await db.select().from(auctionSettings).limit(1);

    if (existingSettings.length > 0) {
      // Update existing settings
      const [updated] = await db
        .update(auctionSettings)
        .set({
          extendThresholdMinutes: data.extendThresholdMinutes,
          extendDurationMinutes: data.extendDurationMinutes,
          updatedAt: new Date(),
        })
        .where(eq(auctionSettings.id, existingSettings[0].id))
        .returning();

      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(auctionSettings)
        .values({
          extendThresholdMinutes: data.extendThresholdMinutes,
          extendDurationMinutes: data.extendDurationMinutes,
        })
        .returning();

      return created;
    }
  }

  async getAuctionSettings(): Promise<AuctionSettings> {
    const settings = await db.select().from(auctionSettings).limit(1);

    if (settings.length === 0) {
      // Return default settings if none exist
      return {
        id: "",
        extendThresholdMinutes: 5,
        extendDurationMinutes: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return settings[0];
  }
}

export const adminService = new AdminService();
