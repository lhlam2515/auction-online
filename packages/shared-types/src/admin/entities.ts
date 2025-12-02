import type { User } from "../user/entities";
import type { UserRole } from "../user/enums";
import type { Product } from "../product/entities";
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
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  pendingUpgrades: number;
  activeAuctions: number;
  recentActivity: {
    type: AdminActionType;
    description: string;
    performedBy: string;
    createdAt: string;
  }[];
}

/**
 * Admin user entity with additional fields
 */
export interface AdminUser extends User {
  isBanned: boolean;
  lockoutEnd?: string;
  banReason?: string;
  lastLogin?: string;
  reportCount?: number;
}

/**
 * Upgrade request entity
 */
export interface UpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: UpgradeRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin view of product with additional moderation fields
 */
export interface AdminProduct extends Product {
  reportCount?: number;
  flagged?: boolean;
  moderatorNotes?: string;
  reportStatus?: ReportStatus;
}
