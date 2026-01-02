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
  banReason?: string;
  bannedBy?: string;
  bannedAt?: string;
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
