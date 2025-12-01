/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API error response structure
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Form action success response
 */
export interface ActionSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

/**
 * Form action error response
 */
export interface ActionErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic action response type
 */
export type ActionResponse<T = unknown> =
  | ActionSuccessResponse<T>
  | ActionErrorResponse;
