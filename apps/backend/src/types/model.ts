import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  autoBids,
  bids,
  categories,
  chatMessages,
  productDescriptionUpdates,
  productImages,
  productQuestions,
  products,
  ratings,
  upgradeRequests,
  users,
  watchLists,
  orders,
  orderPayments,
  orderStatusHistory,
} from "@/models";

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserRole = User["role"];

// Upgrade request types
export type UpgradeRequest = InferSelectModel<typeof upgradeRequests>;
export type NewUpgradeRequest = InferInsertModel<typeof upgradeRequests>;

// Category types
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

// Product types
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

// Product image types
export type ProductImage = InferSelectModel<typeof productImages>;
export type NewProductImage = InferInsertModel<typeof productImages>;

// Product description update types
export type ProductDescriptionUpdate = InferSelectModel<
  typeof productDescriptionUpdates
>;
export type NewProductDescriptionUpdate = InferInsertModel<
  typeof productDescriptionUpdates
>;

// Watch list types
export type WatchList = InferSelectModel<typeof watchLists>;
export type NewWatchList = InferInsertModel<typeof watchLists>;

// Bid types
export type Bid = InferSelectModel<typeof bids>;
export type NewBid = InferInsertModel<typeof bids>;

// Auto bid types
export type AutoBid = InferSelectModel<typeof autoBids>;
export type NewAutoBid = InferInsertModel<typeof autoBids>;

// Rating types
export type Rating = InferSelectModel<typeof ratings>;
export type NewRating = InferInsertModel<typeof ratings>;

// Chat message types
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type NewChatMessage = InferInsertModel<typeof chatMessages>;

// Product question types
export type ProductQuestion = InferSelectModel<typeof productQuestions>;
export type NewProductQuestion = InferInsertModel<typeof productQuestions>;

// Order types
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

// Order payment types
export type OrderPayment = InferSelectModel<typeof orderPayments>;
export type NewOrderPayment = InferInsertModel<typeof orderPayments>;

// Order status history types
export type OrderStatusHistory = InferSelectModel<typeof orderStatusHistory>;
export type NewOrderStatusHistory = InferInsertModel<typeof orderStatusHistory>;
