import type { ProductSortOption } from "../product";

/**
 * Category entity with hierarchical structure
 */
export interface Category {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get products by category query parameters
 * Backend validation: category.validation.ts → getProductsSchema
 */
export interface GetCategoryProductsParams {
  page?: number;
  limit?: number;
  sort?: ProductSortOption;
}

/**
 * Create category request (admin only)
 * Backend validation: admin.validation.ts → createCategorySchema
 */
export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
}

/**
 * Update category request (admin only)
 * Backend validation: admin.validation.ts → updateCategorySchema
 */
export interface UpdateCategoryRequest {
  name?: string;
  parentId?: string | null;
}
