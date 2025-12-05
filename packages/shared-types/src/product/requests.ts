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
 * Product search parameters
 */
export interface ProductSearchParams extends PaginationParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  sortBy?: ProductSortOption;
  sortOrder?: "asc" | "desc";
}
/**
 * Get product listing params
 */
export interface ProductsQueryParams extends PaginationParams {
  categoryId?: string;
  sellerId?: string;
  status?: ProductStatus;
  search?: string;
}

/**
 * Auto extend product auction request
 */
export interface AutoExtendRequest {
  productId: string;
  extendMinutes: number;
}

/**
 * Search products params
 */
export interface SearchProductsParams extends PaginationParams {
  keyword: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "ending_soon";
}
