import type { PaginatedResponse } from "@repo/shared-types";

// Re-export for backward compatibility
export type { PaginatedResponse };

// Legacy pagination metadata structure
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Legacy paginated data structure - matches backend's current format
export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}
