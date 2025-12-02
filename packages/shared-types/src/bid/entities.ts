import type { BidStatus, AutoBidStatus } from "./enums";

/**
 * Core bid info
 */
export interface BidCore {
  id: string;
  productId: string;
  bidderId: string;
  amount: number;
  createdAt: string;
}

/**
 * Bid entity
 */
export interface Bid extends BidCore {
  bidderName: string;
  bidderAvatarUrl?: string;
  isAutoBid: boolean;
  status?: BidStatus;
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
  status: AutoBidStatus;
  createdAt: string;
  updatedAt: string;
}
