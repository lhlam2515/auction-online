import type { ProductStatus } from "../common/enums";

/**
 * Core product entity - matches backend products table
 */
export interface ProductCore {
  id: string;
  name: string;
  slug: string; // SEO-friendly URL
  sellerId: string;
  categoryId: string;
  startPrice: string; // Decimal as string
  stepPrice: string; // Decimal as string
  buyNowPrice?: string; // Decimal as string
  status: ProductStatus;
  startTime: string;
  endTime: string;
  winnerId?: string;
  isAutoExtend: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product with description
 */
export interface Product extends ProductCore {
  description?: string;
}

/**
 * Product listing with additional info for display
 */
export interface ProductListing extends Product {
  categoryName: string;
  sellerName: string;
  sellerAvatarUrl?: string;
  currentPrice?: string; // Highest bid amount
  bidCount: number;
  watchCount: number;
  mainImageUrl?: string;
  isWatching?: boolean; // For authenticated users
}

/**
 * Product image entity - matches backend productImages table
 */
export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isMain: boolean;
  createdAt: string;
}

/**
 * Product watch list entry - matches backend watchLists table
 */
export interface ProductWatchList {
  userId: string;
  productId: string;
  createdAt: string;
}
