import {
  boolean,
  index,
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { bidStatusEnum } from "./enums.model";
import { products } from "./products.model";
import { users } from "./users.model";

// Lịch sử đấu giá (Bids)
export const bids = pgTable(
  "bids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

    status: bidStatusEnum("status").default("VALID"),
    isAuto: boolean("is_auto").default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Lấy lịch sử đấu giá của sản phẩm (cho trang chi tiết)
    index("idx_bids_product_time").on(table.productId, table.createdAt.desc()),
  ]
);

// Cấu hình Đấu giá tự động (Proxy Bidding)
export const autoBids = pgTable(
  "auto_bids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    maxAmount: numeric("max_amount", { precision: 15, scale: 2 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Đảm bảo mỗi user chỉ có 1 cấu hình AutoBid cho mỗi sản phẩm
    unique().on(table.productId, table.userId),
  ]
);
