/**
 * Bid entity
 */
export interface Bid {
  id: string;
  productId: string;
  bidderId: string;
  bidderName: string;
  bidderAvatarUrl?: string;
  amount: number;
  isAutoBid: boolean;
  createdAt: string;
}

/**
 * Place bid request
 * Backend validation: bid.validation.ts → placeBidSchema
 */
export interface PlaceBidRequest {
  amount: number;
}

/**
 * Auto bid configuration
 */
export interface AutoBid {
  id: string;
  productId: string;
  bidderId: string;
  maxAmount: number;
  currentAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
 * Kick bidder from auction request
 * Backend validation: bid.validation.ts → kickBidderSchema
 */
export interface KickBidderRequest {
  userId: string;
  reason: string;
}
