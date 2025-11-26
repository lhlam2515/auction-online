import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { productStatusEnum } from "./enums.model";
import { users } from "./users.model";

// Bảng Danh mục (Cây đệ quy)
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id), // Self-reference
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Bảng Sản phẩm
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),

    name: text("name").notNull(),
    description: text("description"), // HTML Content

    // Giá cả (Dùng NUMERIC để chính xác tiền tệ)
    startPrice: numeric("start_price", { precision: 15, scale: 2 }).notNull(),
    stepPrice: numeric("step_price", { precision: 15, scale: 2 }).notNull(),
    buyNowPrice: numeric("buy_now_price", { precision: 15, scale: 2 }),
    currentPrice: numeric("current_price", { precision: 15, scale: 2 }).default(
      "0"
    ),

    // Thời gian
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),

    // Trạng thái & Logic
    status: productStatusEnum("status").default("PENDING"),
    winnerId: uuid("winner_id").references(() => users.id),
    isAutoExtend: boolean("is_auto_extend").default(true),
    isPaid: boolean("is_paid").default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Tìm kiếm sản phẩm theo tên (Full-text search)
    index("idx_products_name_fts").using(
      "gin",
      sql`to_tsvector('simple', ${table.name})`
    ),
    // Tìm kiếm sản phẩm theo tên (Partial search)
    index("idx_products_name_trgm").using(
      "gin",
      sql`${table.name} gin_trgm_ops`
    ),
    // Lọc sản phẩm theo danh mục và trạng thái
    index("idx_products_cat_status").on(table.categoryId, table.status),
    // Sắp xếp sản phẩm sắp hết giờ (chỉ cho ACTIVE)
    index("idx_products_end_time")
      .on(table.endTime.asc())
      .where(sql`${table.status} = 'ACTIVE'`),
  ]
);

// Ảnh sản phẩm
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  imageUrl: text("image_url").notNull(),
  isMain: boolean("is_main").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Bảng lưu lịch sử cập nhật mô tả
export const productDescriptionUpdates = pgTable(
  "product_description_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

// Bảng Yêu thích (Watch List)
export const watchLists = pgTable(
  "watch_lists",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })]
);
