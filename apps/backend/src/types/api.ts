import type { PaginatedResponse } from "@repo/shared-types";

/**
 * Re-export shared types for use across backend
 */
export type { PaginatedResponse };

/**
 * Backend pagination metadata structure
 * Used for building paginated responses internally
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Legacy paginated data structure
 * Used internally in backend for building responses
 */
export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}
