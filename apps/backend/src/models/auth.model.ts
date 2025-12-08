import { pgTable, index } from "drizzle-orm/pg-core";

import { otpPurposeEnum } from "./enums.model";

// Bảng lưu mã OTP xác thực
export const otpVerifications = pgTable(
  "otp_verifications",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    email: t.text("email").notNull(),
    otpCode: t.text("otp_code").notNull(), // 6-digit OTP
    purpose: otpPurposeEnum("purpose").notNull().default("EMAIL_VERIFICATION"), // EMAIL_VERIFICATION | PASSWORD_RESET
    expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: t.integer("attempts").notNull().default(0),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes
    index("idx_otp_email").on(table.email),
    index("idx_otp_expires_at").on(table.expiresAt),
    index("idx_otp_email_purpose").on(table.email, table.purpose),
  ]
);

// Bảng lưu reset token sau khi verify OTP thành công
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    email: t.text("email").notNull(),
    token: t.text("token").notNull().unique(),
    otpRecordId: t
      .uuid("otp_record_id")
      .notNull()
      .references(() => otpVerifications.id, { onDelete: "cascade" }),
    expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes
    index("idx_reset_token").on(table.token),
    index("idx_reset_token_email").on(table.email),
    index("idx_reset_token_expires_at").on(table.expiresAt),
  ]
);
