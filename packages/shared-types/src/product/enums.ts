// Re-export product status from common enums
export type { ProductStatus } from "../common/enums";

/**
 * Product sort options
 */
export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "ending_soon";

/**
 * Top listing type
 */
export type TopListingType = "ending_soon" | "hot" | "highest_price";
