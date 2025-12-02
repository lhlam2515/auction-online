/**
 * Place bid request
 * Backend validation: bid.validation.ts → placeBidSchema
 */
export interface PlaceBidRequest {
  amount: number;
}

/**
 * Create auto bid request
 * Backend validation: bid.validation.ts → autoBidSchema
 */
export interface CreateAutoBidRequest {
  maxAmount: number;
}

/**
 * Update auto bid request
 * Backend validation: bid.validation.ts → updateAutoBidSchema
 */
export interface UpdateAutoBidRequest {
  maxAmount: number;
}

/**
 * Kick bidder request
 * Backend validation: bid.validation.ts → kickBidderSchema
 */
export interface KickBidderRequest {
  bidderId: string;
  reason?: string;
}
