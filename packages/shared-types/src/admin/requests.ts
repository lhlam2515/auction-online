import type { PaginationParams } from "../common";
import type { UserRole } from "../user/enums";
import type { ProductStatus } from "../product/enums";
import type { UpgradeRequestStatus } from "./enums";

/**
 * Get users query parameters
 * Backend validation: admin.validation.ts → getUsersSchema
 */
export interface GetUsersParams extends PaginationParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  status?: string;
}

/**
 * Ban/unban user request
 * Backend validation: admin.validation.ts → banUserSchema
 */
export interface BanUserRequest {
  reason: string;
  duration?: number; // days, 0 = permanent
  isBanned: boolean;
}

/**
 * Reset user password request (Admin)
 * Backend validation: admin.validation.ts → resetUserPasswordSchema
 */
export interface ResetUserPasswordRequest {
  newPassword: string;
}

/**
 * Get upgrade requests params
 */
export interface GetUpgradeRequestsParams extends PaginationParams {
  status?: UpgradeRequestStatus;
  search?: string;
}

/**
 * Approve/reject upgrade request
 */
export interface ProcessUpgradeRequest {
  reason?: string;
}

/**
 * Get products query parameters (admin)
 * Backend validation: admin.validation.ts → getProductsSchema
 */
export interface AdminGetProductsParams extends PaginationParams {
  status?: ProductStatus;
  search?: string;
  category?: string;
  flagged?: boolean;
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
