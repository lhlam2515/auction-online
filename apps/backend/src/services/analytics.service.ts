import type { SpendingAnalytics } from "@repo/shared-types";
import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { orders } from "@/models/order.model";

class AnalyticsService {
  /**
   * Get bidder spending analytics over a time period
   * @param bidderId - The bidder's user ID (UUID)
   * @param period - Time period: 7d, 30d, or 12m
   */
  async getBidderSpending(
    bidderId: string,
    period: "7d" | "30d" | "12m" = "30d"
  ): Promise<SpendingAnalytics> {
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupByFormat = "YYYY-MM-DD";
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupByFormat = "YYYY-MM-DD";
        break;
      case "12m":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupByFormat = "YYYY-MM";
        break;
    }

    // Create the date expression once to reuse in SELECT, GROUP BY, and ORDER BY
    // Use sql.raw() to inject the format string directly to avoid parameter duplication
    const dateExpression = sql<string>`TO_CHAR(${orders.createdAt}, ${sql.raw(`'${groupByFormat}'`)})`;

    const results = await db
      .select({
        date: dateExpression,
        value: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.winnerId, bidderId),
          eq(orders.status, "COMPLETED"),
          gte(orders.createdAt, startDate)
        )
      )
      .groupBy(dateExpression)
      .orderBy(dateExpression);

    // Fill in missing dates with zero values
    const data = this.fillMissingDates(results, startDate, now, period);

    // Calculate total spending
    const totalSpending = data.reduce((sum, point) => sum + point.value, 0);

    return {
      data,
      totalSpending,
      period,
    };
  }

  /**
   * Fill in missing dates with zero values for consistent chart display
   */
  private fillMissingDates(
    results: { date: string; value: number }[],
    startDate: Date,
    endDate: Date,
    period: "7d" | "30d" | "12m"
  ) {
    const dataMap = new Map(results.map((r) => [r.date, r.value]));
    const filled = [];

    const current = new Date(startDate);
    const format = period === "12m" ? "month" : "day";

    while (current <= endDate) {
      const dateKey =
        format === "month"
          ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
          : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      filled.push({
        date: dateKey,
        value: dataMap.get(dateKey) || 0,
      });

      if (format === "month") {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    return filled;
  }
}

export const analyticsService = new AnalyticsService();
