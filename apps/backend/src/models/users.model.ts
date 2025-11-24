import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { requestStatusEnum, userRoleEnum } from "./enums.model";
import { InferSelectModel } from "drizzle-orm";

// Bảng Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash"), // Nullable nếu dùng Social Login
  role: userRoleEnum("role").default("BIDDER"),
  address: text("address"),
  avatarUrl: text("avatar_url"),

  // Điểm tín nhiệm
  ratingScore: real("rating_score").default(0),
  ratingCount: integer("rating_count").default(0), // Tổng số lượt đánh giá
  goodRatingCount: integer("good_rating_count").default(0), // Số lượt +1

  // Logic bảo mật & Nghiệp vụ
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false), // Soft delete
  sellerExpireDate: timestamp("seller_expire_date", { withTimezone: true }),
  lockoutEnd: timestamp("lockout_end", { withTimezone: true }),

  // Social Login
  socialProvider: text("social_provider"), // 'GOOGLE', 'FACEBOOK'
  socialId: text("social_id"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Bảng yêu cầu nâng cấp lên Seller
export const upgradeRequests = pgTable("upgrade_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason"),
  status: requestStatusEnum("status").default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  adminNote: text("admin_note"),
});
