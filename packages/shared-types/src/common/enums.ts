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
 * User role types - matches backend userRoleEnum
 */
export type UserRole = "BIDDER" | "SELLER" | "ADMIN";

/**
 * Account status types - matches backend accountStatusEnum
 */
export type AccountStatus = "PENDING_VERIFICATION" | "ACTIVE" | "BANNED";

/**
 * Product status types - matches backend productStatusEnum
 */
export type ProductStatus =
  | "PENDING"
  | "ACTIVE"
  | "SOLD"
  | "NO_SALE"
  | "CANCELLED"
  | "SUSPENDED";

/**
 * Request status types - matches backend requestStatusEnum
 */
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Bid status types - matches backend bidStatusEnum
 */
export type BidStatus = "VALID" | "INVALID";

/**
 * Order status types - matches backend orderStatusEnum
 */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Payment method types - matches backend paymentMethodEnum
 */
export type PaymentMethod = "BANK_TRANSFER" | "CREDIT_CARD" | "EWALLET";

/**
 * Shipment provider types - matches backend shipmentProviderEnum
 */
export type ShippingProvider = "VNPOST" | "GHN" | "GHTK" | "JNT";

/**
 * OTP purpose types - matches backend otpPurposeEnum
 */
export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

/**
 * Payment status types
 */
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

/**
 * Message type for chat
 */
export type MessageType = "TEXT" | "IMAGE" | "FILE";

/**
 * Rating score types
 */
export type RatingScore = 1 | -1;

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
