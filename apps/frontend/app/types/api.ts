import type {
  ApiResponse,
  PaginatedResponse,
  ApiError as SharedApiError,
} from "@repo/shared-types";

// Re-export shared types
export type { ApiResponse, PaginatedResponse };

// Success response - compatible with shared types
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// Error response - compatible with shared types
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: unknown;
  };
}

// Legacy pagination types - kept for backward compatibility
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type PaginatedSuccessResponse<T> = SuccessResponse<Paginated<T>>;

// API Error class for consistent error handling
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}
