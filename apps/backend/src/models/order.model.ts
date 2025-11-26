import {
  pgTable,
  uuid,
  numeric,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./products.model";
import { users } from "./users.model";
import { orderStatusEnum, paymentMethodEnum } from "./enums.model";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    winnerId: uuid("winner_id")
      .notNull()
      .references(() => users.id),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id),

    finalPrice: numeric("final_price", { precision: 15, scale: 2 }).notNull(),
    status: orderStatusEnum("status").default("PENDING"),

    shippingAddress: text("shipping_address"),
    phoneNumber: text("phone_number"),
    trackingNumber: text("tracking_number"),
    shippingProvider: text("shipping_provider"),

    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_orders_product").on(table.productId),
    index("idx_orders_winner").on(table.winnerId),
    index("idx_orders_seller").on(table.sellerId),
    index("idx_orders_status").on(table.status),
  ]
);

export const orderPayments = pgTable("order_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  method: paymentMethodEnum("method").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  transactionRef: text("transaction_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  reason: text("reason"), // Lý do hủy đơn (nếu có)
  changedBy: uuid("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow(),
});
