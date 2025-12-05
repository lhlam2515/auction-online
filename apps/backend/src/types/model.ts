import type {
  ApiResponse,
  PaginatedResponse,
  ProductSearchFilters,
  BidValidationResult,
  DashboardStats,
  NotificationType,
  Notification,
} from "@repo/shared-types";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  autoBids,
  bids,
  categories,
  chatMessages,
  otpVerifications,
  productImages,
  productQuestions,
  productUpdates,
  products,
  ratings,
  upgradeRequests,
  users,
  watchLists,
  orders,
  orderPayments,
} from "@/models";

// Select types (for reading from database)
export type User = InferSelectModel<typeof users>;
export type UpgradeRequest = InferSelectModel<typeof upgradeRequests>;
export type OtpVerification = InferSelectModel<typeof otpVerifications>;
export type Category = InferSelectModel<typeof categories>;
export type Product = InferSelectModel<typeof products>;
export type ProductImage = InferSelectModel<typeof productImages>;
export type ProductUpdate = InferSelectModel<typeof productUpdates>;
export type WatchList = InferSelectModel<typeof watchLists>;
export type Bid = InferSelectModel<typeof bids>;
export type AutoBid = InferSelectModel<typeof autoBids>;
export type Rating = InferSelectModel<typeof ratings>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type ProductQuestion = InferSelectModel<typeof productQuestions>;
export type Order = InferSelectModel<typeof orders>;
export type OrderPayment = InferSelectModel<typeof orderPayments>;

// Insert types (for creating new records)
export type NewUser = InferInsertModel<typeof users>;
export type NewUpgradeRequest = InferInsertModel<typeof upgradeRequests>;
export type NewOtpVerification = InferInsertModel<typeof otpVerifications>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewProduct = InferInsertModel<typeof products>;
export type NewProductImage = InferInsertModel<typeof productImages>;
export type NewProductUpdate = InferInsertModel<typeof productUpdates>;
export type NewWatchList = InferInsertModel<typeof watchLists>;
export type NewBid = InferInsertModel<typeof bids>;
export type NewAutoBid = InferInsertModel<typeof autoBids>;
export type NewRating = InferInsertModel<typeof ratings>;
export type NewChatMessage = InferInsertModel<typeof chatMessages>;
export type NewProductQuestion = InferInsertModel<typeof productQuestions>;
export type NewOrder = InferInsertModel<typeof orders>;
export type NewOrderPayment = InferInsertModel<typeof orderPayments>;

// Convenience type aliases
export type UserRole = User["role"];

// Re-export shared types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  ProductSearchFilters,
  BidValidationResult,
  DashboardStats,
  NotificationType,
  Notification,
};

// Backend-specific extended types with relations
export type ProductWithDetails = Product & {
  seller: User;
  category: Category;
  images: ProductImage[];
  bids?: Bid[];
  winner?: User | null;
  currentBid?: Bid | null;
  bidCount?: number;
  highestBid?: Bid | null;
};

export type ProductWithImages = Product & {
  images: ProductImage[];
};

export type UserWithStats = User & {
  _count: {
    productsAsSeller: number;
    bids: number;
    ratingsReceived: number;
  };
};

export type BidWithUser = Bid & {
  user: Pick<User, "id" | "fullName" | "avatarUrl" | "ratingScore">;
};

export type OrderWithDetails = Order & {
  product: ProductWithImages;
  winner: User;
  seller: User;
  payments: OrderPayment[];
};

export type CategoryTree = Category & {
  children?: CategoryTree[];
  parent?: Category | null;
  _count: {
    products: number;
  };
};

export type ChatThread = {
  productId: string;
  participants: [User, User];
  lastMessage: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
};

// Backend-specific user profile with extended information
export type UserProfile = User & {
  stats: {
    totalBids: number;
    totalWins: number;
    totalSales: number;
    successRate: number;
    avgResponseTime?: number;
  };
  recentActivity: {
    recentBids: BidWithUser[];
    recentQuestions: ProductQuestion[];
    activeSales: Product[];
    wonAuctions: Product[];
  };
};

// Enhanced product search result for backend processing
export type ProductSearchResult = ProductWithDetails & {
  relevanceScore?: number;
  distanceFromUser?: number;
  isWatched?: boolean;
  hasActiveAutoBid?: boolean;
};
