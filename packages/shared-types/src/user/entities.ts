import type { UserRole, UserStatus } from "./enums";

/**
 * Core user entity
 */
export interface UserCore {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Full user entity
 */
export interface User extends UserCore {
  address?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  status?: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public profile view for other users
 */
export interface PublicProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  joinedAt: string;
  ratingSummary: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      [rating: number]: number;
    };
  };
}

/**
 * Extended user rating summary with total count
 */
export interface UserRatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [rating: number]: number;
  };
}
