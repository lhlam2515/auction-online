import type { SuccessResponse } from "@/types/error";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type PaginatedResponse<T> = SuccessResponse<Paginated<T>>;
