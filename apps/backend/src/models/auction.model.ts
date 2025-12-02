import { sql } from "drizzle-orm";
import { pgTable, index, unique, check } from "drizzle-orm/pg-core";

import { bidStatusEnum } from "./enums.model";
import { products } from "./products.model";
import { users } from "./users.model";

// Lịch sử đấu giá (Bids)
export const bids = pgTable(
  "bids",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: t.numeric("amount", { precision: 15, scale: 2 }).notNull(),

    status: bidStatusEnum("status").notNull().default("VALID"),
    isAuto: t.boolean("is_auto").notNull().default(false),

    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    index("idx_bids_product_time").on(table.productId, table.createdAt.desc()), // Bid history
    check("positive_bid_amount", sql`${table.amount} > 0`),
  ]
);

// Cấu hình Đấu giá tự động (Proxy Bidding)
export const autoBids = pgTable(
  "auto_bids",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    maxAmount: t.numeric("max_amount", { precision: 15, scale: 2 }).notNull(),
    isActive: t.boolean("is_active").notNull().default(true),

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
    unique("unique_auto_bid_per_user_product").on(
      table.productId,
      table.userId
    ),
    check("positive_max_amount", sql`${table.maxAmount} > 0`),
  ]
);
