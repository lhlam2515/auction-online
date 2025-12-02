/**
 * Bid status enum
 */
export type BidStatus =
  | "VALID"
  | "INVALID"
  | "OUTBID"
  | "WINNING"
  | "WON"
  | "LOST";

/**
 * Auto bid status
 */
export type AutoBidStatus = "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";
