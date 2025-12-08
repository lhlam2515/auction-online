import type { Product, ProductListing } from "./entities";
import type { TopListingType } from "./enums";

/**
 * Top listing parameters
 */
export interface TopListingParams {
  // type: TopListingType;
  limit: number;
}

/**
 * Top listings response for homepage
 */
export interface TopListingResponse {
  endingSoon: ProductListing[];
  hot: ProductListing[];
  highestPrice: ProductListing[];
}

/**
 * Image upload response
 */
export interface UploadImagesResponse {
  urls: string[];
}

/**
 * Product description update (alias for DescriptionUpdate)
 */
export interface UpdateDescriptionResponse {
  id: string;
  productId: string;
  updatedBy: string;
  content: string;
  createdAt: Date | string;
}

/**
 * Related products response
 */
export interface RelatedProductsResponse {
  products: ProductListing[];
  totalCount: number;
}
