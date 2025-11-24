import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "./products.model";
import { users } from "./users.model";

// Đánh giá (Review/Feedback)
export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => users.id),

    score: integer("score").notNull(),
    comment: text("comment"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Mỗi người dùng chỉ được đánh giá 1 lần cho mỗi sản phẩm
    unique().on(table.productId, table.senderId),
    // Chỉ cho phép điểm là 1 hoặc -1
    check("score_check", sql`${table.score} IN (1, -1)`),
  ]
);

// Chat (Giữa Winner và Seller)
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Hỏi đáp công khai (Q&A)
export const productQuestions = pgTable("product_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  questionContent: text("question_content").notNull(),

  answerContent: text("answer_content"),
  isPublic: boolean("is_public").default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
});
