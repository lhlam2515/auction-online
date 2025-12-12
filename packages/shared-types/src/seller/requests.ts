import type { PaginationParams } from "../common";
import type { ProductStatus } from "../product/enums";
import type { OrderStatus } from "../order/enums";

/**
 * Get seller's products query parameters
 * Backend validation: seller.validation.ts → getProductsSchema
 */
export interface GetSellerProductsParams extends PaginationParams {
  status?: ProductStatus;
  // search?: string;
  // categoryId?: string;
}

/**
 * Get seller's orders query parameters
 * Backend validation: seller.validation.ts → getOrdersSchema
 */
export interface GetSellerOrdersParams extends PaginationParams {
  status?: OrderStatus;
}

/**
 * Update seller profile request
 */
export interface UpdateSellerProfileRequest {
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}
