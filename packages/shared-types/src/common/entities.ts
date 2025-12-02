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
 * Generic ID parameter
 */
export interface IdParam {
  id: string;
}

/**
 * Timestamp fields
 */
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteFields extends TimestampFields {
  deletedAt?: string;
}
