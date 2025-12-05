import { PaginationParams } from "../common";

/**
 * Create category request
 */
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Update category request
 */
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

/**
 * Get category products params
 */
export interface GetCategoryProductsParams extends PaginationParams {
  sort?: "price_asc" | "price_desc" | "ending_soon" | "newest";
}
