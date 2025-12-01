/**
 * User role types
 */
export type UserRole = "BIDDER" | "SELLER" | "ADMIN";

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  address?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update user profile request
 * Backend validation: user.validation.ts → updateProfileSchema
 */
export interface UpdateProfileRequest {
  fullName?: string;
  address?: string;
  avatarUrl?: string;
}

/**
 * Change password request
 * Backend validation: user.validation.ts → changePasswordSchema
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Seller upgrade request data
 * Backend validation: user.validation.ts → upgradeRequestSchema
 */
export interface UpgradeRequestData {
  reason: string;
}
