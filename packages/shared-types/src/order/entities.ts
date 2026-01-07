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
  productId: string | null; // Nullable when product deleted
  winnerId: string | null; // Nullable when winner deleted
  sellerId: string | null; // Nullable when seller deleted
  finalPrice: string; // Decimal as string
  shippingCost: string; // Decimal as string
  totalAmount: string; // Decimal as string
  status: OrderStatus;

  // Shipping information
  shippingAddress: string;
  phoneNumber: string;
  shippingProvider: ShippingProvider | null;
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
 * Note: These fields can be null when related user/product is deleted
 */
export interface OrderWithDetails extends Order {
  product: {
    name: string;
    slug: string;
    thumbnail?: string;
  } | null; // Nullable when product deleted
  winner: {
    fullName: string;
    email: string;
    address: string | null;
    ratingScore: number;
  } | null; // Nullable when winner deleted
  seller: {
    fullName: string;
    email: string;
    address: string | null;
    ratingScore: number;
  } | null; // Nullable when seller deleted
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
  paymentProofUrl: string | null;
  refundedAt: Date | string | null;
  refundAmount: string | null; // Decimal as string
  createdAt: Date | string;
}
