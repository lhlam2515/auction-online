// Re-export product status from common enums
export type { ProductStatus } from "../common/enums";

/**
 * Product sort options
 */
export type ProductSortOption =
  | "price_asc"
  | "price_desc"
  | "ending_soon"
  | "newest"
  | "most_bids";

/**
 * Top listing type
 */
export type TopListingType = "ending_soon" | "hot" | "new";
