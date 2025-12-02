import type { RatingValue, RatingType } from "./enums";

/**
 * Create rating request
 * Backend validation: rating.validation.ts → createRatingSchema
 */
export interface CreateRatingRequest {
  orderId: string;
  targetUserId: string;
  rating: RatingValue;
  comment?: string;
  ratingType: RatingType;
}

/**
 * Get ratings query parameters
 */
export interface GetRatingsParams {
  page?: number;
  limit?: number;
  ratingType?: RatingType;
  minRating?: RatingValue;
}
