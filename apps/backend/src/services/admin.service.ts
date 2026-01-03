import type {
  AdminStats,
  OrderStatus,
  PaymentStatus,
  UpgradeRequestStatus,
  CategoryInsights,
  CategoryGMV,
  TopCategory,
  AuctionHealth,
  AuctionHealthStats,
  BidDensity,
  Operations,
  SellerUpgradeFunnel,
  TransactionPipeline,
  Engagement,
  UserReputationDistribution,
  BiddingActivity,
  AdminAnalytics,
  GetUpgradeRequestsParams,
  PaginatedResponse,
  AdminUpgradeRequest,
} from "@repo/shared-types";
import {
  count,
  eq,
  sum,
  and,
  inArray,
  sql,
  desc,
  gte,
  isNotNull,
  avg,
  countDistinct,
} from "drizzle-orm";

import { db } from "@/config/database";
import {
  users,
  upgradeRequests,
  products,
  orders,
  orderPayments,
  categories,
  bids,
} from "@/models";

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
   * Get category insights including GMV by category and top categories
   */
  async getCategoryInsights(): Promise<CategoryInsights> {
    // Get GMV by category
    const categoryGMVResults = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        productCount: count(products.id),
        orderCount: countDistinct(orders.id),
        gmv: sum(orders.totalAmount),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .leftJoin(
        orders,
        and(
          eq(orders.productId, products.id),
          eq(orders.status, "COMPLETED" as OrderStatus)
        )
      )
      .leftJoin(
        orderPayments,
        and(
          eq(orderPayments.orderId, orders.id),
          eq(orderPayments.status, "SUCCESS" as PaymentStatus)
        )
      )
      .where(isNotNull(categories.parentId))
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sum(orders.totalAmount)));

    // Calculate total GMV for percentage
    const totalGMV = categoryGMVResults.reduce(
      (acc, cat) => acc + Number(cat.gmv ?? 0),
      0
    );

    const gmvByCategory: CategoryGMV[] = categoryGMVResults.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      gmv: Number(cat.gmv ?? 0),
      percentage: totalGMV > 0 ? (Number(cat.gmv ?? 0) / totalGMV) * 100 : 0,
      productCount: cat.productCount,
      orderCount: cat.orderCount,
    }));

    // Get top 5 categories by product count
    // Note: Conditional aggregation still needs raw SQL in Drizzle
    const topCategoriesResults = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        productCount: count(products.id),
        activeCount: sql<number>`count(case when ${products.status} = 'ACTIVE' then 1 end)`,
        completedCount: sql<number>`count(case when ${products.status} not in ('PENDING', 'ACTIVE') then 1 end)`,
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .where(isNotNull(categories.parentId))
      .groupBy(categories.id, categories.name)
      .orderBy(desc(count(products.id)))
      .limit(5);

    const topCategories: TopCategory[] = topCategoriesResults.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      productCount: cat.productCount,
      activeCount: Number(cat.activeCount),
      completedCount: Number(cat.completedCount),
    }));

    return {
      gmvByCategory,
      topCategories,
    };
  }

  /**
   * Get auction health metrics including success rate and bid density
   */
  async getAuctionHealth(): Promise<AuctionHealth> {
    // Get auction success statistics
    // Note: Conditional COUNT still requires raw SQL in Drizzle
    const [auctionStats] = await db
      .select({
        totalCompleted: count(),
        successful: sql<number>`count(case when ${products.status} = 'SOLD' and ${products.winnerId} is not null then 1 end)`,
        failed: sql<number>`count(case when ${products.status} in ('NO_SALE', 'CANCELLED', 'SUSPENDED') and ${products.winnerId} is null then 1 end)`,
      })
      .from(products)
      .where(sql`${products.status} not in ('PENDING', 'ACTIVE')`);

    const totalCompleted = auctionStats.totalCompleted;
    const successfulAuctions = Number(auctionStats.successful);
    const failedAuctions = Number(auctionStats.failed);
    const successRate =
      totalCompleted > 0 ? (successfulAuctions / totalCompleted) * 100 : 0;

    // Get bid statistics using ORM functions
    const [bidStats] = await db
      .select({
        totalBids: count(),
        totalProducts: countDistinct(bids.productId),
      })
      .from(bids);

    const totalBids = bidStats.totalBids;
    const averageBidsPerProduct =
      bidStats.totalProducts > 0 ? totalBids / bidStats.totalProducts : 0;

    const stats: AuctionHealthStats = {
      totalCompleted,
      successfulAuctions,
      failedAuctions,
      successRate,
      averageBidsPerProduct,
      totalBids,
    };

    // Get top 10 products by bid density
    const bidDensityResults = await db
      .select({
        productId: products.id,
        productName: products.name,
        bidCount: count(bids.id),
        startPrice: products.startPrice,
        finalPrice: products.currentPrice,
      })
      .from(products)
      .leftJoin(bids, eq(bids.productId, products.id))
      .groupBy(
        products.id,
        products.name,
        products.startPrice,
        products.currentPrice
      )
      .orderBy(desc(count(bids.id)))
      .limit(10);

    const bidDensityTop10: BidDensity[] = bidDensityResults.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      bidCount: product.bidCount,
      startPrice: Number(product.startPrice),
      finalPrice: product.finalPrice ? Number(product.finalPrice) : undefined,
    }));

    return {
      stats,
      bidDensityTop10,
    };
  }

  /**
   * Get operations metrics including seller funnel and transaction pipeline
   */
  async getOperationsMetrics(): Promise<Operations> {
    // Seller upgrade funnel
    const [userRoleStats] = await db
      .select({
        totalBidders: sql<number>`count(case when ${users.role} = 'BIDDER' then 1 end)`,
        totalSellers: sql<number>`count(case when ${users.role} = 'SELLER' then 1 end)`,
      })
      .from(users);

    const [upgradeStats] = await db
      .select({
        pending: sql<number>`count(case when ${upgradeRequests.status} = 'PENDING' then 1 end)`,
        approved: sql<number>`count(case when ${upgradeRequests.status} = 'APPROVED' then 1 end)`,
        rejected: sql<number>`count(case when ${upgradeRequests.status} = 'REJECTED' then 1 end)`,
        total: count(upgradeRequests.id),
      })
      .from(upgradeRequests);

    const totalBidders = Number(userRoleStats.totalBidders);
    const requestsSent = upgradeStats.total;
    const requestsPending = Number(upgradeStats.pending);
    const requestsApproved = Number(upgradeStats.approved);
    const requestsRejected = Number(upgradeStats.rejected);
    const conversionRate =
      totalBidders > 0 ? (requestsApproved / totalBidders) * 100 : 0;

    const sellerFunnel: SellerUpgradeFunnel = {
      totalBidders,
      requestsSent,
      requestsPending,
      requestsApproved,
      requestsRejected,
      conversionRate,
    };

    // Transaction pipeline
    const [pipelineStats] = await db
      .select({
        pending: sql<number>`COUNT(CASE WHEN ${orders.status} = 'PENDING' THEN 1 END)`,
        confirmed: sql<number>`COUNT(CASE WHEN ${isNotNull(orders.sellerConfirmedAt)} AND ${orders.status} = 'PAID' THEN 1 END)`,
        shipped: sql<number>`COUNT(CASE WHEN ${orders.status} = 'SHIPPED' THEN 1 END)`,
        completed: sql<number>`COUNT(CASE WHEN ${orders.status} = 'COMPLETED' THEN 1 END)`,
        cancelled: sql<number>`COUNT(CASE WHEN ${orders.status} = 'CANCELLED' THEN 1 END)`,
      })
      .from(orders);

    const transactionPipeline: TransactionPipeline = {
      pending: Number(pipelineStats.pending),
      confirmed: Number(pipelineStats.confirmed),
      shipped: Number(pipelineStats.shipped),
      completed: Number(pipelineStats.completed),
      cancelled: Number(pipelineStats.cancelled),
    };

    return {
      sellerFunnel,
      transactionPipeline,
    };
  }

  /**
   * Get engagement metrics including reputation distribution and bidding activity
   */
  async getEngagementMetrics(): Promise<Engagement> {
    // User reputation distribution (rating score is 0-1 decimal representing percentage)
    const [reputationStats] = await db
      .select({
        excellent: sql<number>`count(case when ${users.ratingScore} >= 0.9 then 1 end)`,
        good: sql<number>`count(case when ${users.ratingScore} >= 0.8 and ${users.ratingScore} < 0.9 then 1 end)`,
        average: sql<number>`count(case when ${users.ratingScore} >= 0.7 and ${users.ratingScore} < 0.8 then 1 end)`,
        poor: sql<number>`count(case when ${users.ratingScore} > 0 and ${users.ratingScore} < 0.7 then 1 end)`,
        noRating: sql<number>`count(case when ${users.ratingScore} = 0 or ${users.ratingScore} is null then 1 end)`,
      })
      .from(users);

    const reputationDistribution: UserReputationDistribution = {
      excellent: Number(reputationStats.excellent),
      good: Number(reputationStats.good),
      average: Number(reputationStats.average),
      poor: Number(reputationStats.poor),
      noRating: Number(reputationStats.noRating),
    };

    // Bidding activity for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const biddingActivityResults = await db
      .select({
        date: sql<string>`DATE(${bids.createdAt})`,
        bidCount: count(),
        uniqueBidders: countDistinct(bids.userId),
        averageBidValue: avg(bids.amount),
      })
      .from(bids)
      .where(gte(bids.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${bids.createdAt})`)
      .orderBy(sql`DATE(${bids.createdAt}) ASC`);

    const biddingActivity: BiddingActivity[] = biddingActivityResults.map(
      (activity) => ({
        date: activity.date,
        bidCount: activity.bidCount,
        uniqueBidders: activity.uniqueBidders,
        averageBidValue: Number(activity.averageBidValue ?? 0),
      })
    );

    return {
      reputationDistribution,
      biddingActivity,
    };
  }

  /**
   * Get full analytics data
   */
  async getFullAnalytics(): Promise<AdminAnalytics> {
    const [categoryInsights, auctionHealth, operations, engagement] =
      await Promise.all([
        this.getCategoryInsights(),
        this.getAuctionHealth(),
        this.getOperationsMetrics(),
        this.getEngagementMetrics(),
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
  async approveUpgradeRequest(id: string, adminId: string): Promise<void> {
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
}

export const adminService = new AdminService();
