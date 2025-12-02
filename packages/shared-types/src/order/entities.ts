import type { OrderStatus, PaymentMethod, ShippingProvider } from "./enums";

/**
 * Core order info
 */
export interface OrderCore {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  finalPrice: number;
  status: OrderStatus;
}

/**
 * Order entity
 */
export interface Order extends OrderCore {
  productName: string;
  productImage?: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  phoneNumber?: string;
  trackingNumber?: string;
  shippingProvider?: ShippingProvider;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order feedback from buyer/seller
 */
export interface OrderFeedback {
  rating: number;
  comment?: string;
}
