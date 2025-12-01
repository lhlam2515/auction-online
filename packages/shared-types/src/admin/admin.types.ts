import type { User, UserRole } from "../user";
import type { ProductStatus } from "../product";

/**
 * Upgrade request status
 */
export type UpgradeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

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
    type: string;
    description: string;
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
}

/**
 * Get users query parameters
 * Backend validation: admin.validation.ts → getUsersSchema
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

/**
 * Ban/unban user request
 * Backend validation: admin.validation.ts → banUserSchema
 */
export interface BanUserRequest {
  isBanned: boolean;
  reason?: string;
  lockoutEnd?: string;
}

/**
 * Reset user password request (admin)
 */
export interface ResetUserPasswordRequest {
  newPassword: string;
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
  adminNote?: string;
  createdAt: string;
}

/**
 * Get upgrade requests query parameters
 * Backend validation: admin.validation.ts → getUpgradesSchema
 */
export interface GetUpgradeRequestsParams {
  page?: number;
  limit?: number;
  status?: UpgradeRequestStatus;
}

/**
 * Process upgrade request (approve/reject)
 * Backend validation: admin.validation.ts → processUpgradeSchema
 */
export interface ProcessUpgradeRequest {
  adminNote?: string;
}

/**
 * Get products query parameters (admin)
 * Backend validation: admin.validation.ts → getProductsSchema
 */
export interface GetProductsParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  search?: string;
}

/**
 * Reject product request
 * Backend validation: admin.validation.ts → rejectProductSchema
 */
export interface RejectProductRequest {
  reason: string;
}

/**
 * Suspend product request
 * Backend validation: admin.validation.ts → suspendProductSchema
 */
export interface SuspendProductRequest {
  reason: string;
}
