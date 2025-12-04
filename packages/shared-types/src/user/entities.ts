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
  address?: string;
  avatarUrl?: string;

  // Credit scoring fields
  ratingScore: number; // 0-5 range
  ratingCount: number;

  // Seller-specific
  sellerExpireDate?: string; // ISO timestamp

  createdAt: string;
  updatedAt: string;
}

/**
 * Public profile view for other users
 */
export interface PublicProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  ratingScore: number;
  ratingCount: number;
  createdAt: string;
}

/**
 * User rating summary
 */
export interface UserRatingSummary {
  averageRating: number;
  totalRatings: number;
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
