/**
 * Order status enum
 */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Payment methods
 */
export type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | "CASH";

/**
 * Shipping providers
 */
export type ShippingProvider = "FEDEX" | "UPS" | "DHL" | "USPS" | "OTHER";
