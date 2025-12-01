import type { PaginationParams } from "../common";

/**
 * Product status enum
 */
export type ProductStatus = "PENDING" | "ACTIVE" | "ENDED" | "CANCELLED";

/**
 * Product sort options
 */
export type ProductSortOption =
  | "price_asc"
  | "price_desc"
  | "ending_soon"
  | "newest";

/**
 * Top listing type
 */
export type TopListingType = "ending_soon" | "hot" | "new";

/**
 * Product entity
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  stepPrice: number;
  startTime: string;
  endTime: string;
  status: ProductStatus;
  isAutoExtend: boolean;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatarUrl?: string;
  bidCount: number;
  watchCount: number;
  isWatching?: boolean;
  currentWinnerId?: string;
  currentWinnerName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create product request
 * Backend validation: product.validation.ts → createProductSchema
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: string;
  startPrice: number;
  stepPrice: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
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
 * Toggle auto-extend request
 * Backend validation: product.validation.ts → autoExtendSchema
 */
export interface AutoExtendRequest {
  isAutoExtend: boolean;
}

/**
 * Search products parameters
 * Backend validation: product.validation.ts → searchProductsSchema
 */
export interface SearchProductsParams extends PaginationParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  sort?: ProductSortOption;
}

/**
 * Top listing query parameters
 * Backend validation: product.validation.ts → topListingSchema
 */
export interface TopListingParams {
  type: TopListingType;
  limit?: number;
}

/**
 * Top listings response for homepage
 */
export interface TopListingResponse {
  endingSoon: Product[];
  hot: Product[];
  newListings: Product[];
}

/**
 * Product description update history
 */
export interface DescriptionUpdate {
  id: string;
  productId: string;
  description: string;
  updatedBy: string;
  updatedByName: string;
  createdAt: string;
}

/**
 * Image upload response
 */
export interface UploadImagesResponse {
  urls: string[];
}
