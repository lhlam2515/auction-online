import type { SellerStats } from "@repo/shared-types";
import { eq, and, count, sql, isNotNull } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, products } from "@/models";

export class SellerService {
  async getStats(sellerId: string): Promise<SellerStats> {
    // Get total active products (status = "ACTIVE")
    const activeProductsResult = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(eq(products.sellerId, sellerId), eq(products.status, "ACTIVE"))
      );

    const totalActiveProducts = activeProductsResult[0]?.count || 0;

    // Get total sold products and revenue from completed orders
    // Filter out orders where sellerId was set to null (deleted users)
    const soldStatsResult = await db
      .select({
        totalSold: count(),
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), '0')`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.sellerId, sellerId),
          eq(orders.status, "COMPLETED"),
          isNotNull(orders.sellerId)
        )
      );

    const totalSoldProducts = soldStatsResult[0]?.totalSold || 0;
    const totalRevenue = soldStatsResult[0]?.totalRevenue || "0";

    // Get total products ever listed
    const totalProductsResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.sellerId, sellerId));

    const totalProductsEverListed = totalProductsResult[0]?.count || 0;

    // Calculate success rate
    const successRate =
      totalProductsEverListed > 0
        ? totalSoldProducts / totalProductsEverListed
        : 0;

    return {
      totalActiveProducts,
      totalSoldProducts,
      totalRevenue,
      successRate,
    };
  }
}

export const sellerService = new SellerService();
