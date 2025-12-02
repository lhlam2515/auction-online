import type { RatingValue, RatingType } from "./enums";

/**
 * Rating entity
 */
export interface Rating {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  rating: RatingValue;
  comment?: string;
  ratingType: RatingType;
  createdAt: string;
}

/**
 * Rating summary for user
 */
export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [rating: number]: number;
  };
}
