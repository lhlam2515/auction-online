import type { ProductStatus } from "../product";
import type { OrderStatus } from "../order";

/**
 * Get seller's products query parameters
 * Backend validation: seller.validation.ts → getProductsSchema
 */
export interface GetSellerProductsParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
}

/**
 * Get seller's orders query parameters
 * Backend validation: seller.validation.ts → getOrdersSchema
 */
export interface GetSellerOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
