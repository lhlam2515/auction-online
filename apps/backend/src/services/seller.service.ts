import type { SellerStats } from "@repo/shared-types";
import { eq, and, count, isNotNull, sql } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { orders, products, users } from "@/models";

const PRODUCT_STATUS_ACTIVE = "ACTIVE";
const ORDER_STATUS_COMPLETED = "COMPLETED";
const DEFAULT_REVENUE = 0;
const MIN_SUCCESS_RATE = 0;

export class SellerService {
  async isTemporarySeller(sellerId: string): Promise<boolean> {
    // A temporary seller is defined as a seller whose account has expired
    // but still has active products and incomplete orders.
    try {
      const userProfile = await db.query.users.findFirst({
        where: eq(users.id, sellerId),
        columns: { id: true, role: true, sellerExpireDate: true },
      });

      if (!userProfile || userProfile.role !== "SELLER") {
        return false;
      }

      let hasActiveProducts = false;
      let hasIncompleteOrders = false;

      const [activeProducts, incompleteOrders] = await Promise.all([
        // Check for active products
        db.query.products.findFirst({
          where: and(
            eq(products.sellerId, sellerId),
            eq(products.status, "ACTIVE")
          ),
          columns: { id: true },
        }),
        // Check for incomplete orders (not COMPLETED or CANCELLED)
        db.query.orders.findFirst({
          where: and(
            eq(orders.sellerId, sellerId),
            sql`${orders.status} IN ('PENDING', 'PAID', 'SHIPPED')`
          ),
          columns: { id: true },
        }),
      ]);

      hasActiveProducts = !!activeProducts;
      hasIncompleteOrders = !!incompleteOrders;

      const isExpired = userProfile.sellerExpireDate
        ? new Date(userProfile.sellerExpireDate) <= new Date()
        : false;

      return isExpired && hasActiveProducts && hasIncompleteOrders;
    } catch (error) {
      logger.error("Error checking temporary seller status:", error);
      return false;
    }
  }

  async getStats(sellerId: string): Promise<SellerStats> {
    try {
      // Execute all queries in parallel for better performance
      const [activeProducts, soldStats, totalProducts] = await Promise.all([
        this.getActiveProductsCount(sellerId),
        this.getSoldProductsStats(sellerId),
        this.getTotalProductsCount(sellerId),
      ]);

      const successRate = this.calculateSuccessRate(
        soldStats.totalSold,
        totalProducts
      );

      return {
        totalActiveProducts: activeProducts,
        totalSoldProducts: soldStats.totalSold,
        totalRevenue: soldStats.totalRevenue,
        successRate,
      };
    } catch (error) {
      logger.error(`Error fetching stats for seller ${sellerId}:`, error);
      throw error;
    }
  }

  private async getActiveProductsCount(sellerId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.sellerId, sellerId),
          eq(products.status, PRODUCT_STATUS_ACTIVE)
        )
      );

    return result[0]?.count || 0;
  }

  private async getSoldProductsStats(
    sellerId: string
  ): Promise<{ totalSold: number; totalRevenue: number }> {
    // Only count completed orders to ensure revenue accuracy
    const result = await db
      .select({
        totalSold: count(),
        totalRevenue: sql<number>`cast(sum(${orders.finalPrice}) as int)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.sellerId, sellerId),
          eq(orders.status, ORDER_STATUS_COMPLETED),
          isNotNull(orders.sellerId)
        )
      );

    return {
      totalSold: result[0]?.totalSold || 0,
      totalRevenue: result[0]?.totalRevenue || DEFAULT_REVENUE,
    };
  }

  private async getTotalProductsCount(sellerId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.sellerId, sellerId));

    return result[0]?.count || 0;
  }

  private calculateSuccessRate(
    soldProducts: number,
    totalProducts: number
  ): number {
    if (totalProducts === 0) {
      return MIN_SUCCESS_RATE;
    }

    return soldProducts / totalProducts;
  }
}

export const sellerService = new SellerService();
