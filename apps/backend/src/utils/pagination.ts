import type { PaginationMeta, Paginated } from "@/types/api";

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
});

// Helper to build paginated response data structure
export const toPaginated = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): Paginated<T> => ({
  items,
  pagination: buildPaginationMeta(page, limit, total),
});
