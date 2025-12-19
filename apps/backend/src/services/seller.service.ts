import { eq, and, count, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { orders, products } from "@/models";

export interface SellerStats {
  totalActiveProducts: number;
  totalSoldProducts: number;
  totalRevenue: string; // Decimal as string
}

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
    const soldStatsResult = await db
      .select({
        totalSold: count(),
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), '0')`,
      })
      .from(orders)
      .where(
        and(eq(orders.sellerId, sellerId), eq(orders.status, "COMPLETED"))
      );

    const totalSoldProducts = soldStatsResult[0]?.totalSold || 0;
    const totalRevenue = soldStatsResult[0]?.totalRevenue || "0";

    return {
      totalActiveProducts,
      totalSoldProducts,
      totalRevenue,
    };
  }
}

export const sellerService = new SellerService();
