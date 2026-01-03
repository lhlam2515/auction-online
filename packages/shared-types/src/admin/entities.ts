import type { User } from "../user/entities";
import type { Product } from "../product/entities";
import type { AccountStatus } from "../common/enums";
import type {
  UpgradeRequestStatus,
  AdminActionType,
  ReportStatus,
} from "./enums";

/**
 * Admin dashboard statistics
 */
export interface AdminStats {
  totalUsers: number;
  totalActiveAuctions: number;
  totalPendingUpgrades: number;
  totalTransactionValue: number; // Total value of completed transactions (GMV)
}

/**
 * Admin activity log
 */
export interface AdminActivity {
  id: string;
  type: AdminActionType;
  description: string;
  performedBy: string;
  performedByName: string;
  targetId?: string; // User ID, Product ID, etc.
  createdAt: string;
}

/**
 * Admin view of user with moderation fields
 */
export interface AdminUser extends User {
  loginCount?: number;
  lastLoginAt?: string;
}

/**
 * Admin user list item (simplified for list view)
 */
export interface AdminUserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "BIDDER" | "SELLER" | "ADMIN";
  accountStatus: AccountStatus;
  ratingScore: number;
  ratingCount: number;
  createdAt: string;
}

/**
 * Admin view of upgrade request with user details
 */
export interface AdminUpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason?: string;
  status: UpgradeRequestStatus;
  processedBy?: string;
  processedByName?: string;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

/**
 * Admin view of product with moderation fields
 */
export interface AdminProduct extends Product {
  sellerName: string;
  sellerEmail: string;
  reportCount?: number;
  moderatorNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

/**
 * Category Insights - Analytics
 */
export interface CategoryGMV {
  categoryId: string;
  categoryName: string;
  gmv: number;
  percentage: number;
  productCount: number;
  orderCount: number;
}

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  productCount: number;
  activeCount: number;
  completedCount: number;
}

export interface CategoryInsights {
  gmvByCategory: CategoryGMV[];
  topCategories: TopCategory[];
}

/**
 * Auction Health Metrics
 */
export interface AuctionHealthStats {
  totalCompleted: number;
  successfulAuctions: number;
  failedAuctions: number;
  successRate: number;
  averageBidsPerProduct: number;
  totalBids: number;
}

export interface BidDensity {
  productId: string;
  productName: string;
  bidCount: number;
  startPrice: number;
  finalPrice?: number;
}

export interface AuctionHealth {
  stats: AuctionHealthStats;
  bidDensityTop10: BidDensity[];
}

/**
 * Operations & Conversion Metrics
 */
export interface SellerUpgradeFunnel {
  totalBidders: number;
  requestsSent: number;
  requestsPending: number;
  requestsApproved: number;
  requestsRejected: number;
  conversionRate: number;
}

export interface TransactionPipeline {
  pending: number;
  confirmed: number;
  shipped: number;
  completed: number;
  cancelled: number;
}

export interface Operations {
  sellerFunnel: SellerUpgradeFunnel;
  transactionPipeline: TransactionPipeline;
}

/**
 * Engagement & Trust Metrics
 */
export interface UserReputationDistribution {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  noRating: number;
}

export interface BiddingActivity {
  date: string;
  hour?: number;
  bidCount: number;
  uniqueBidders: number;
  averageBidValue: number;
}

export interface Engagement {
  reputationDistribution: UserReputationDistribution;
  biddingActivity: BiddingActivity[];
}

/**
 * Combined Admin Analytics Response
 */
export interface AdminAnalytics {
  categoryInsights: CategoryInsights;
  auctionHealth: AuctionHealth;
  operations: Operations;
  engagement: Engagement;
}
