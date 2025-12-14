import type { PaginationParams } from "../common";
import type { ProductStatus, ProductSortOption } from "./enums";

/**
 * Create product request
 * Backend validation: product.validation.ts → createProductSchema
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: string;
  startPrice: number;
  buyNowPrice?: number;
  stepPrice: number;
  startTime: string;
  endTime: string;
  isAutoExtend: boolean;
  images: string[];
}

/**
 * Update product description request
 * Backend validation: product.validation.ts → updateDescriptionSchema
 */
export interface UpdateDescriptionRequest {
  content: string;
}

/**
 * Auto extend product auction request
 */
export interface AutoExtendRequest {
  isAutoExtend: boolean;
}

/**
 * Search products params
 */
export interface SearchProductsParams extends PaginationParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  sort?: ProductSortOption;
}
