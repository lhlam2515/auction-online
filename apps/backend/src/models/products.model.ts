import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { pgTable, primaryKey, index, unique, check } from "drizzle-orm/pg-core";

import { productStatusEnum } from "./enums.model";
import { users } from "./users.model";

// Bảng Danh mục (Cây đệ quy)
export const categories = pgTable(
  "categories",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    slug: t.text("slug").notNull(), // SEO-friendly URL
    parentId: t.uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "restrict", // Prevent deletion if has children
    }),
    level: t.integer("level").notNull().default(0), // Tree depth for optimization
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
    index("idx_categories_parent").on(table.parentId),
    unique("unique_category_slug").on(table.slug),
  ]
);

// Bảng Sản phẩm - Optimized with constraints
export const products = pgTable(
  "products",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    sellerId: t
      .uuid("seller_id")
      .references(() => users.id, { onDelete: "set null" }), // Retain products if user deleted
    categoryId: t
      .uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    name: t.text("name").notNull(),
    slug: t.text("slug").notNull(), // SEO-friendly URL
    description: t.text("description").notNull(),
    freeToBid: t.boolean("free_to_bid").notNull().default(true),

    // Pricing - optimized with constraints
    startPrice: t.numeric("start_price", { precision: 15, scale: 2 }).notNull(),
    stepPrice: t.numeric("step_price", { precision: 15, scale: 2 }).notNull(),
    buyNowPrice: t.numeric("buy_now_price", { precision: 15, scale: 2 }),
    currentPrice: t.numeric("current_price", { precision: 15, scale: 2 }),

    // Timing
    startTime: t.timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: t.timestamp("end_time", { withTimezone: true }).notNull(),

    // Status & Logic
    status: productStatusEnum("status").notNull().default("PENDING"),
    winnerId: t
      .uuid("winner_id")
      .references(() => users.id, { onDelete: "set null" }),
    isAutoExtend: t.boolean("is_auto_extend").notNull().default(true),

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
    // Search indexes (CRITICAL)
    index("idx_products_name_fts").using(
      "gin",
      sql`to_tsvector('simple', ${table.name} || ' ' || COALESCE(${table.description}, ''))`
    ),
    index("idx_products_name_trgm").using(
      "gin",
      sql`${table.name} gin_trgm_ops`
    ),

    // Core business indexes only
    index("idx_products_category_status").on(table.categoryId, table.status), // Category browsing
    index("idx_products_active_ending_soon")
      .on(table.endTime.asc())
      .where(sql`${table.status} = 'ACTIVE'`), // Ending soon auctions
    unique("unique_product_slug").on(table.slug), // SEO URLs

    // Business logic constraints
    check(
      "valid_price_range",
      sql`${table.startPrice} > 0 AND ${table.stepPrice} > 0`
    ),
    check("valid_time_range", sql`${table.endTime} > ${table.startTime}`),
  ]
);

// Ảnh sản phẩm - Optimized
export const productImages = pgTable(
  "product_images",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: t.text("image_url").notNull(),
    altText: t.text("alt_text"), // SEO and accessibility
    displayOrder: t.integer("display_order").notNull().default(1),
    isMain: t.boolean("is_main").notNull().default(false),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    index("idx_product_images_product").on(table.productId),
    check("positive_display_order", sql`${table.displayOrder} > 0`),
  ]
);

// Lịch sử cập nhật sản phẩm
export const productUpdates = pgTable(
  "product_updates",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    updatedBy: t
      .uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: t.text("content").notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    index("idx_product_updates_product").on(table.productId),
  ]
);

// Bảng Yêu thích (Watch List)
export const watchLists = pgTable(
  "watch_lists",
  (t) => ({
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow(),
  }),
  (table) => [primaryKey({ columns: [table.userId, table.productId] })]
);
