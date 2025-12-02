import type { ProductStatus } from "./enums";

/**
 * Core product entity - lightweight version
 */
export interface ProductCore {
  id: string;
  name: string;
  currentPrice: number;
  status: ProductStatus;
  endTime: string;
}

/**
 * Product listing info - for search results
 */
export interface ProductListing {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  endTime: string;
  status: ProductStatus;
  images: string[];
  sellerId: string;
  sellerName: string;
  bidCount: number;
  watchCount: number;
  createdAt: string;
}

/**
 * Full product details - for product page
 */
export interface Product extends ProductListing {
  stepPrice: number;
  startTime: string;
  isAutoExtend: boolean;
  sellerAvatarUrl?: string;
  isWatching?: boolean;
  currentWinnerId?: string;
  currentWinnerName?: string;
  updatedAt: string;
}

/**
 * Product image entity
 */
export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

/**
 * Product description update history
 */
export interface ProductDescriptionUpdate {
  id: string;
  productId: string;
  description: string;
  createdAt: string;
  createdBy: string;
}
