/**
 * Rating score type (like/dislike system)
 */
export type RatingScore = 1 | -1;

/**
 * Rating summary for a user
 */
export interface RatingSummary {
  userId: string;
  averageRating: number;
  totalRatings: number;
  positiveCount: number;
  negativeCount: number;
}

/**
 * Rating entity
 */
export interface Rating {
  id: string;
  fromUserId: string;
  fromUserName: string;
  receiverId: string;
  receiverName: string;
  productId: string;
  score: RatingScore;
  comment?: string;
  createdAt: string;
}

/**
 * Create rating request
 * Backend validation: rating.validation.ts → createRatingSchema
 */
export interface CreateRatingRequest {
  productId: string;
  receiverId: string;
  score: RatingScore;
  comment?: string;
}
