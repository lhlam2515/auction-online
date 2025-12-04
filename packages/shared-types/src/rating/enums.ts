// Re-export rating score from common enums (backend uses 1 or -1)
export type { RatingScore } from "../common/enums";

/**
 * Rating type for different contexts
 */
export type RatingType = "BUYER_TO_SELLER" | "SELLER_TO_BUYER";
