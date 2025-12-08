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
  trackingNumber: string | null;

  // Timeline
  shippedAt: Date | null;
  receivedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order with related information for display
 */
export interface OrderWithDetails extends Order {
  product: {
    name: string;
    slug: string;
    thumbnail?: string;
  };
  winner: {
    fullName: string;
    email: string;
  };
  seller: {
    fullName: string;
    email: string;
  };
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
  paidAt: Date | null;
  transactionRef?: string;
  refundedAt: Date | null;
  refundAmount?: string; // Decimal as string
  createdAt: string;
}
