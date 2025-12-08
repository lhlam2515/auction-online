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
  amount: number;
}

/**
 * Update payment information request
 */
export interface UpdatePaymentRequest {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPhone: string;
}

/**
 * Ship order request
 */
export interface ShipOrderRequest {
  trackingNumber?: string;
  carrier?: ShippingProvider;
  estimatedDelivery?: string;
}
