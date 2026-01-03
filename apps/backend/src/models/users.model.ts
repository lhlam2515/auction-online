import { sql } from "drizzle-orm";
import { pgTable, index, check } from "drizzle-orm/pg-core";

import {
  requestStatusEnum,
  userRoleEnum,
  accountStatusEnum,
} from "./enums.model";

// Bảng Users
export const users = pgTable(
  "users",
  (t) => ({
    id: t.uuid("id").primaryKey(), // Uses Supabase auth.users.id directly
    email: t.text("email").notNull(), // Synced from Supabase auth.users.email
    username: t.text("username").notNull().unique(), // Unique username
    fullName: t.text("full_name").notNull(),
    birthDate: t.date("birth_date"),
    role: userRoleEnum("role").notNull().default("BIDDER"),
    accountStatus: accountStatusEnum("account_status")
      .notNull()
      .default("PENDING_VERIFICATION"),
    address: t.text("address"),
    avatarUrl: t.text("avatar_url"), // Can be synced from Supabase user metadata

    // Credit scoring - simplified
    ratingScore: t.real("rating_score").notNull().default(0),
    ratingCount: t.integer("rating_count").notNull().default(0),

    // Business logic only
    sellerExpireDate: t.timestamp("seller_expire_date", { withTimezone: true }),

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
    index("idx_users_email").on(table.email), // Login lookup

    // Business logic constraints
    check(
      "rating_score_range",
      sql`${table.ratingScore} >= 0 AND ${table.ratingScore} <= 5`
    ),
    check("rating_counts_positive", sql`${table.ratingCount} >= 0`),
  ]
);

// Bảng yêu cầu nâng cấp lên Seller
export const upgradeRequests = pgTable(
  "upgrade_requests",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: t.text("reason"),
    status: requestStatusEnum("status").notNull().default("PENDING"),
    processedBy: t
      .uuid("processed_by")
      .references(() => users.id, { onDelete: "set null" }), // Admin who processed
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: t.timestamp("processed_at", { withTimezone: true }),
    adminNote: t.text("admin_note"),
  }),
  (table) => [
    // Essential indexes only
    index("idx_upgrade_requests_user_status").on(table.userId, table.status),
  ]
);
