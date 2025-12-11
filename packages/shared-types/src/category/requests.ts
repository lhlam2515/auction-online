import { PaginationParams } from "../common";

/**
 * Create category request
 */
export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
}

/**
 * Update category request
 */
export interface UpdateCategoryRequest {
  name?: string;
  parentId?: string | null;
}

/**
 * Get category products params
 */
export interface GetCategoryProductsParams extends PaginationParams {
  sort?: "price_asc" | "price_desc" | "ending_soon" | "newest";
}
