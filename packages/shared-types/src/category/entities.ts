/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  children?: Category[];
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Category tree node
 */
export interface CategoryTree {
  id: string;
  name: string;
  description?: string;
  level: number;
  productCount: number;
  children: CategoryTree[];
}
