import type {
  OrderStatus,
  PaymentMethod,
  ShippingProvider,
  PaymentStatus,
} from "./enums";

/**
 * Order entity - matches backend orders table
 */
export interface Order {
  id: string;
  orderNumber: string; // Human-readable order number
  productId: string;
  winnerId: string;
  sellerId: string;
  finalPrice: string; // Decimal as string
  shippingCost: string; // Decimal as string
  totalAmount: string; // Decimal as string
  status: OrderStatus;

  // Shipping information
  shippingAddress: string;
  phoneNumber: string;
  trackingNumber?: string;

  // Timeline
  shippedAt?: string;
  receivedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Order with related information for display
 */
export interface OrderWithDetails extends Order {
  productName: string;
  productImage?: string;
  winnerName: string;
  winnerEmail: string;
  sellerName: string;
  sellerEmail: string;
}

/**
 * Order payment entity - matches backend orderPayments table
 */
export interface OrderPayment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: string; // Decimal as string
  status: PaymentStatus;
  paidAt?: string;
  transactionRef?: string;
  refundedAt?: string;
  refundAmount?: string; // Decimal as string
  createdAt: string;
}
