import type { PaginationParams } from "../common";
import type { OrderStatus, PaymentMethod, ShippingProvider } from "./enums";

/**
 * Get orders query parameters
 * Backend validation: order.validation.ts → getOrdersSchema
 */
export interface GetOrdersParams extends PaginationParams {
  status?: OrderStatus;
}

/**
 * Create order request (for instant buy now)
 */
export interface CreateOrderRequest {
  productId: string;
  winnerId: string;
  sellerId: string;
  finalPrice: string; // Decimal as string
}

/**
 * Cancel order request
 */
export interface CancelOrderRequest {
  reason: string;
}

/**
 * Order feedback request
 */
export interface OrderFeedbackRequest {
  rating: number;
  comment?: string;
}

/**
 * Mark order as paid request
 */
export interface MarkPaidRequest {
  paymentMethod: PaymentMethod;
  transactionId?: string;
  amount: string;
}

/**
 * Update shipping information request
 */
export interface UpdateShippingInfoRequest {
  shippingAddress: string;
  phoneNumber: string;
}

/**
 * Ship order request
 */
export interface ShipOrderRequest {
  trackingNumber: string;
  shippingProvider: ShippingProvider;
}
