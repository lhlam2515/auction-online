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
  accountStatus?: "PENDING_VERIFICATION" | "ACTIVE" | "BANNED";
  q?: string;
  sortBy?: "createdAt" | "fullName" | "email" | "ratingScore";
  sortOrder?: "asc" | "desc";
}

/**
 * Ban/unban user request
 * Backend validation: admin.validation.ts → banUserSchema
 */
export interface BanUserRequest {
  isBanned: boolean;
  reason?: string; // Required when banning, min 10 characters
  duration?: number; // days, 0 = permanent ban
}

/**
 * Reset user password request (Admin)
 * Backend validation: admin.validation.ts → resetUserPasswordSchema
 */
export interface ResetUserPasswordRequest {
  newPassword: string;
}

/**
 * Update user info request (Admin)
 * Backend validation: admin.validation.ts → updateUserInfoSchema
 */
export interface UpdateUserInfoRequest {
  fullName?: string;
  address?: string;
  birthDate?: string;
}

/**
 * Update account status request (Admin)
 * Backend validation: admin.validation.ts → updateAccountStatusSchema
 */
export interface UpdateAccountStatusRequest {
  accountStatus: "PENDING_VERIFICATION" | "ACTIVE" | "BANNED";
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
  q?: string;
  categoryId?: string;
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
