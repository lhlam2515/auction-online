import type { Paginated, PaginationMeta } from "@/types/api";

export const buildPaginationMeta = (
  page: number,
  pageSize: number,
  total: number
): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
});

export const toPaginated = <T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): Paginated<T> => ({
  items,
  meta: buildPaginationMeta(page, pageSize, total),
});
