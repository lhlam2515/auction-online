/**
 * HTTP status codes commonly used
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Sort order options
 */
export type SortOrder = "asc" | "desc";

/**
 * Common status types
 */
export type Status = "active" | "inactive" | "pending" | "archived";

/**
 * Auction status types
 */
export type AuctionStatus =
  | "upcoming"
  | "active"
  | "ending_soon"
  | "ended"
  | "cancelled";

/**
 * Notification types
 */
export type NotificationType =
  | "bid_placed"
  | "bid_outbid"
  | "auction_won"
  | "auction_lost"
  | "payment_received"
  | "order_shipped"
  | "question_asked"
  | "question_answered"
  | "rating_received"
  | "upgrade_approved"
  | "upgrade_rejected";
