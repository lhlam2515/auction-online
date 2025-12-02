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
