import type { RatingScore } from "../common/enums";

/**
 * Rating entity - matches backend ratings table
 * Note: Ratings are CASCADE deleted when product is deleted (not SET NULL)
 */
export interface Rating {
  id: string;
  productId: string; // CASCADE deleted with product
  senderId: string;
  receiverId: string;
  score: RatingScore; // 1 (positive) or -1 (negative)
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Rating with user information for display
 * Note: Ratings are CASCADE deleted with product, so productName always exists
 */
export interface RatingWithUsers extends Rating {
  senderName: string;
  senderAvatarUrl?: string;
  receiverName: string;
  productName: string; // Always present due to CASCADE constraint
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
