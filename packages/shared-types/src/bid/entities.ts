import type { BidStatus } from "../common/enums";
import type { AutoBidStatus } from "./enums";

/**
 * Bid entity - matches backend bids table
 */
export interface Bid {
  id: string;
  productId: string;
  userId: string;
  amount: string; // Decimal as string
  status: BidStatus;
  isAuto: boolean;
  createdAt: Date | string;
}

/**
 * Bid with user information for display
 */
export interface BidWithUser extends Bid {
  userName: string;
  userAvatarUrl?: string;
}

/**
 * Auto bid configuration - matches backend autoBids table
 */
export interface AutoBid {
  id: string;
  productId: string;
  userId: string;
  maxAmount: string; // Decimal as string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
