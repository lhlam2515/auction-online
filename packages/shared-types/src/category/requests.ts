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
export interface GetCategoryProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
