import { sql } from "drizzle-orm";
import { pgTable, index, unique, check } from "drizzle-orm/pg-core";

import {
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "./enums.model";
import { products } from "./products.model";
import { users } from "./users.model";

export const orders = pgTable(
  "orders",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    orderNumber: t.text("order_number").notNull(), // Human-readable order number
    productId: t
      .uuid("product_id")
      .references(() => products.id, { onDelete: "set null" }), // Keep order history even if product deleted
    winnerId: t
      .uuid("winner_id")
      .references(() => users.id, { onDelete: "set null" }), // Keep order history for statistics
    sellerId: t
      .uuid("seller_id")
      .references(() => users.id, { onDelete: "set null" }), // Keep order history for statistics

    finalPrice: t.numeric("final_price", { precision: 15, scale: 2 }).notNull(),
    shippingCost: t
      .numeric("shipping_cost", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: t
      .numeric("total_amount", { precision: 15, scale: 2 })
      .notNull(),
    status: orderStatusEnum("status").notNull().default("PENDING"),

    // Shipping information
    shippingAddress: t.text("shipping_address").notNull(),
    phoneNumber: t.text("phone_number").notNull(),
    trackingNumber: t.text("tracking_number"),

    // Timeline
    sellerConfirmedAt: t.timestamp("seller_confirmed_at", {
      withTimezone: true,
    }),
    shippedAt: t.timestamp("shipped_at", { withTimezone: true }),
    receivedAt: t.timestamp("received_at", { withTimezone: true }),
    cancelledAt: t.timestamp("cancelled_at", { withTimezone: true }),
    cancelReason: t.text("cancel_reason"),

    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    index("idx_orders_winner_status").on(table.winnerId, table.status),
    index("idx_orders_seller_status").on(table.sellerId, table.status),

    // Unique constraints
    unique("unique_order_number").on(table.orderNumber),
    unique("unique_product_order").on(table.productId), // One order per product

    // Business constraints
    check(
      "positive_amounts",
      sql`${table.finalPrice} > 0 AND ${table.shippingCost} >= 0 AND ${table.totalAmount} > 0`
    ),
    check(
      "total_amount_calculation",
      sql`${table.totalAmount} = ${table.finalPrice} + ${table.shippingCost}`
    ),
    check("different_users", sql`${table.winnerId} != ${table.sellerId}`),
  ]
);

export const orderPayments = pgTable(
  "order_payments",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    orderId: t
      .uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: paymentMethodEnum("method").notNull(),
    amount: t.numeric("amount", { precision: 15, scale: 2 }).notNull(),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    paidAt: t.timestamp("paid_at", { withTimezone: true }),
    transactionRef: t.text("transaction_ref"),
    refundedAt: t.timestamp("refunded_at", { withTimezone: true }),
    refundAmount: t.numeric("refund_amount", { precision: 15, scale: 2 }),

    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    index("idx_order_payments_order").on(table.orderId),

    // Business constraints
    check("positive_payment_amount", sql`${table.amount} > 0`),
    check(
      "valid_refund_amount",
      sql`${table.refundAmount} IS NULL OR (${table.refundAmount} > 0 AND ${table.refundAmount} <= ${table.amount})`
    ),
  ]
);
