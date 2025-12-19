/**
 * Update user profile request
 * Backend validation: user.validation.ts → updateProfileSchema
 */
export interface UpdateProfileRequest {
  fullName: string | null;
  email: string | null;
  address: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
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
