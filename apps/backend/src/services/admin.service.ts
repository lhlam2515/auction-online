import type {
  AdminStats,
  OrderStatus,
  PaymentStatus,
  UpgradeRequestStatus,
} from "@repo/shared-types";
import { count, eq, sum, and, inArray } from "drizzle-orm";

import { db } from "@/config/database";
import {
  users,
  upgradeRequests,
  products,
  orders,
  orderPayments,
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
}

export const adminService = new AdminService();
