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
 * Order entity
 */
export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  finalPrice: number;
  status: OrderStatus;
  shippingAddress?: string;
  phoneNumber?: string;
  trackingNumber?: string;
  shippingProvider?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get orders query parameters
 * Backend validation: order.validation.ts → getOrdersSchema
 */
export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/**
 * Update payment information request
 * Backend validation: order.validation.ts → updatePaymentSchema
 */
export interface UpdatePaymentRequest {
  shippingAddress: string;
  phoneNumber: string;
}

/**
 * Ship order request
 * Backend validation: order.validation.ts → shipOrderSchema
 */
export interface ShipOrderRequest {
  trackingNumber?: string;
  shippingProvider?: string;
}

/**
 * Cancel order request
 * Backend validation: order.validation.ts → cancelOrderSchema
 */
export interface CancelOrderRequest {
  reason: string;
}

/**
 * Order feedback request
 * Backend validation: order.validation.ts → feedbackSchema
 */
export interface OrderFeedbackRequest {
  rating: number;
  comment?: string;
}
