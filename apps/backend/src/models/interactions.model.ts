import { sql } from "drizzle-orm";
import { pgTable, check, index, unique } from "drizzle-orm/pg-core";

import { products } from "./products.model";
import { users } from "./users.model";

// Đánh giá (Review/Feedback)
export const ratings = pgTable(
  "ratings",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    senderId: t
      .uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: t
      .uuid("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    score: t.integer("score").notNull(),
    comment: t.text("comment"),

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
    unique("unique_rating_per_product_sender").on(
      table.productId,
      table.senderId
    ),
    check("valid_rating_score", sql`${table.score} IN (1, -1)`),
    check("different_users", sql`${table.senderId} != ${table.receiverId}`),
  ]
);

// Chat (Giữa Winner và Seller)
export const chatMessages = pgTable(
  "chat_messages",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    productId: t
      .uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    senderId: t
      .uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: t
      .uuid("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: t.text("content").notNull(),
    isRead: t.boolean("is_read").notNull().default(false),
    messageType: t.text("message_type").notNull().default("TEXT"), // TEXT, IMAGE, FILE

    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    check(
      "different_chat_users",
      sql`${table.senderId} != ${table.receiverId}`
    ),
    check(
      "valid_message_type",
      sql`${table.messageType} IN ('TEXT', 'IMAGE', 'FILE')`
    ),
  ]
);

// Hỏi đáp công khai (Q&A)
export const productQuestions = pgTable(
  "product_questions",
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
    questionContent: t.text("question_content").notNull(),

    answerContent: t.text("answer_content"),
    answeredBy: t.uuid("answered_by").references(() => users.id), // Who answered
    isPublic: t.boolean("is_public").notNull().default(true),

    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    answeredAt: t.timestamp("answered_at", { withTimezone: true }),
  }),
  (table) => [
    // Essential indexes only
    index("idx_questions_product").on(table.productId), // Q&A lookup
  ]
);
