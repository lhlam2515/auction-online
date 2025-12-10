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
  currentPrice?: string; // Decimal as string
  status: ProductStatus;
  startTime: Date | string;
  endTime: Date | string;
  winnerId: string | null;
  isAutoExtend: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Product with description
 */
export interface Product extends ProductCore {
  description: string;
}

/**
 * Product listing with additional info for display
 */
export interface ProductListing extends Product {
  categoryName: string;
  sellerName: string;
  sellerAvatarUrl?: string;
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
 * Product update history entity - matches backend productUpdates table
 */
export interface ProductUpdate {
  id: string;
  productId: string;
  updatedBy: string;
  content: string;
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
