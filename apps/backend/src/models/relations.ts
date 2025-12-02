import { relations } from "drizzle-orm";
import {
  users,
  upgradeRequests,
  categories,
  products,
  productImages,
  watchLists,
  bids,
  autoBids,
  ratings,
  chatMessages,
  productQuestions,
  orders,
  orderPayments,
} from "./index";

// User Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  // User selling products
  productsAsSeller: many(products, { relationName: "seller" }),

  // User winning products
  productsAsWinner: many(products, { relationName: "winner" }),

  // User bids
  bids: many(bids),

  // User auto bids
  autoBids: many(autoBids),

  // User ratings given
  ratingsGiven: many(ratings, { relationName: "sender" }),

  // User ratings received
  ratingsReceived: many(ratings, { relationName: "receiver" }),

  // User chat messages sent
  messagesSent: many(chatMessages, { relationName: "sender" }),

  // User chat messages received
  messagesReceived: many(chatMessages, { relationName: "receiver" }),

  // User product questions
  productQuestions: many(productQuestions, { relationName: "questioner" }),

  // User answered questions
  answeredQuestions: many(productQuestions, { relationName: "answerer" }),

  // User watch lists
  watchLists: many(watchLists),

  // User upgrade requests
  upgradeRequests: many(upgradeRequests, { relationName: "user" }),

  // Upgrade requests processed by admin
  upgradeRequestsProcessed: many(upgradeRequests, { relationName: "admin" }),

  // Orders as winner
  ordersAsWinner: many(orders, { relationName: "winner" }),

  // Orders as seller
  ordersAsSeller: many(orders, { relationName: "seller" }),
}));

// Upgrade Request Relations
export const upgradeRequestsRelations = relations(
  upgradeRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [upgradeRequests.userId],
      references: [users.id],
      relationName: "user",
    }),

    processedBy: one(users, {
      fields: [upgradeRequests.processedBy],
      references: [users.id],
      relationName: "admin",
    }),
  })
);

// Category Relations
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  // Category products
  products: many(products),

  // Parent category
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent",
  }),

  // Child categories
  children: many(categories, { relationName: "parent" }),
}));

// Product Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  // Product seller
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
    relationName: "seller",
  }),

  // Product winner
  winner: one(users, {
    fields: [products.winnerId],
    references: [users.id],
    relationName: "winner",
  }),

  // Product category
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),

  // Product images
  images: many(productImages),

  // Product bids
  bids: many(bids),

  // Product auto bids
  autoBids: many(autoBids),

  // Product ratings
  ratings: many(ratings),

  // Product chat messages
  chatMessages: many(chatMessages),

  // Product questions
  questions: many(productQuestions),

  // Product watch lists
  watchLists: many(watchLists),

  // Product orders
  orders: many(orders),
}));

// Product Image Relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Watch List Relations
export const watchListsRelations = relations(watchLists, ({ one }) => ({
  user: one(users, {
    fields: [watchLists.userId],
    references: [users.id],
  }),

  product: one(products, {
    fields: [watchLists.productId],
    references: [products.id],
  }),
}));

// Bid Relations
export const bidsRelations = relations(bids, ({ one }) => ({
  product: one(products, {
    fields: [bids.productId],
    references: [products.id],
  }),

  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
}));

// Auto Bid Relations
export const autoBidsRelations = relations(autoBids, ({ one }) => ({
  product: one(products, {
    fields: [autoBids.productId],
    references: [products.id],
  }),

  user: one(users, {
    fields: [autoBids.userId],
    references: [users.id],
  }),
}));

// Rating Relations
export const ratingsRelations = relations(ratings, ({ one }) => ({
  product: one(products, {
    fields: [ratings.productId],
    references: [products.id],
  }),

  sender: one(users, {
    fields: [ratings.senderId],
    references: [users.id],
    relationName: "sender",
  }),

  receiver: one(users, {
    fields: [ratings.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Chat Message Relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  product: one(products, {
    fields: [chatMessages.productId],
    references: [products.id],
  }),

  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),

  receiver: one(users, {
    fields: [chatMessages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Product Question Relations
export const productQuestionsRelations = relations(
  productQuestions,
  ({ one }) => ({
    product: one(products, {
      fields: [productQuestions.productId],
      references: [products.id],
    }),

    user: one(users, {
      fields: [productQuestions.userId],
      references: [users.id],
      relationName: "questioner",
    }),

    answeredBy: one(users, {
      fields: [productQuestions.answeredBy],
      references: [users.id],
      relationName: "answerer",
    }),
  })
);

// Order Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),

  winner: one(users, {
    fields: [orders.winnerId],
    references: [users.id],
    relationName: "winner",
  }),

  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: "seller",
  }),

  // Order payments
  payments: many(orderPayments),
}));

// Order Payment Relations
export const orderPaymentsRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, {
    fields: [orderPayments.orderId],
    references: [orders.id],
  }),
}));
