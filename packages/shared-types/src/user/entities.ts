import type { UserRole, AccountStatus } from "../common/enums";

/**
 * Core user entity - matches backend users table
 */
export interface UserCore {
  id: string; // UUID from Supabase auth
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Full user entity - matches backend users table
 */
export interface User extends UserCore {
  accountStatus: AccountStatus;
  address: string | null;
  avatarUrl: string | null;
  birthDate: Date | string | null;

  // Credit scoring fields
  ratingScore: number; // 0-5 range
  ratingCount: number;

  // Seller-specific
  sellerExpireDate: Date | string | null; // ISO timestamp
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Public profile view for other users
 */
export interface PublicProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  ratingScore: number;
  ratingCount: number;
  createdAt: Date | string;
  stats?: {
    totalAuctionProducts: number; // As Seller
    totalBiddingProducts: number; // As Bidder
  };
}

/**
 * User rating summary
 */
export interface UserRatingSummary {
  averageRating: number;
  totalRatings: number;
}

/**
 * User statistics for dashboard
 */
export interface UserStats {
  totalBidsPlaced: number;
  totalAuctionsWon: number;
  totalSpent: number; // In smallest currency unit
  activeBids: number; // Number of products currently bidding on
}

/**
 * Upgrade request entity - matches backend upgradeRequests table
 */
export interface UpgradeRequest {
  id: string;
  userId: string;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  processedBy?: string; // Admin user ID
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

/**
 * OTP verification entity - matches backend otpVerifications table
 */
export interface OtpVerification {
  id: string;
  email: string;
  otpCode: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}
