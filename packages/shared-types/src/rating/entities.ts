import type { RatingScore } from "../common/enums";

/**
 * Rating entity - matches backend ratings table
 */
export interface Rating {
  id: string;
  productId: string;
  senderId: string;
  receiverId: string;
  score: RatingScore; // 1 (positive) or -1 (negative)
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Rating with user information for display
 */
export interface RatingWithUsers extends Rating {
  senderName: string;
  senderAvatarUrl?: string;
  receiverName: string;
  productName: string;
}

/**
 * Rating summary for user profile
 */
export interface RatingSummary {
  positiveCount: number;
  negativeCount: number;
  totalRatings: number;
  positivePercentage: number;
}
