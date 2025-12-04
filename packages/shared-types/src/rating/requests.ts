import type { RatingScore } from "../common/enums";

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

/**
 * Get ratings query parameters
 */
export interface GetRatingsParams {
  page?: number;
  limit?: number;
  userId?: string;
  productId?: string;
}
