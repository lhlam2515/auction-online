import { RatingSummary } from "../rating";
import { PublicProfile } from "../user";
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
  sellerConfirmedAt: Date | string | null;
  shippedAt: Date | string | null;
  receivedAt: Date | string | null;
  cancelledAt: Date | string | null;
  cancelReason: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;
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
    address: string;
    ratingScore: number;
  };
  seller: {
    fullName: string;
    email: string;
    address: string;
    ratingScore: number;
  };
  payment?: OrderPayment;
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
  paidAt: Date | string | null;
  transactionRef: string | null;
  refundedAt: Date | string | null;
  refundAmount: string | null; // Decimal as string
  createdAt: Date | string;
}
