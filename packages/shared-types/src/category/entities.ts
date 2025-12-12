/**
 * Category entity - matches backend categories table
 */
export interface Category {
  id: string;
  name: string;
  slug: string; // SEO-friendly URL
  parentId: string | null;
  level: number; // Tree depth for optimization
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Category with children for tree structure
 */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

/**
 * Category tree node for navigation
 */
export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  level: number;
  children: CategoryTree[];
}

/**
 * Category with product count for statistics
 */
export interface CategoryWithStats extends Category {
  productCount: number;
}
