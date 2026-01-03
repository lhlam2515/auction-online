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
  freeToBid: boolean;
  startPrice: string; // Decimal as string
  stepPrice: string; // Decimal as string
  buyNowPrice: string | null; // Decimal as string
  currentPrice: string | null; // Decimal as string
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
  sellerAvatarUrl: string | null;
  currentWinnerName: string | null; // masked name of highest bidder
  bidCount: number;
  watchCount: number;
  mainImageUrl: string | null;
  isWatching: boolean | null; // For authenticated users
}

/**
 * Product image entity - matches backend productImages table
 */
export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  isMain: boolean;
  createdAt: Date | string;
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

export interface ProductDetails extends Product {
  mainImageUrl: string;
  categoryName: string;
  sellerName: string;
  sellerAvatarUrl: string | null;
  sellerRatingScore: number; // Average rating of the seller
  sellerRatingCount: number; // Total number of ratings for the seller
  orderId: string | null;
}
