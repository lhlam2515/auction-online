/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
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

/**
 * Product search filters
 */
export interface ProductSearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string[];
  sellerId?: string;
  searchTerm?: string;
  sortBy?: "price_asc" | "price_desc" | "ending_soon" | "newest" | "most_bids";
  page?: number;
  pageSize?: number;
}

/**
 * Bid validation result
 */
export interface BidValidationResult {
  isValid: boolean;
  errors: string[];
  minimumBid?: number;
  suggestedBid?: number;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalUsers: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: number;
  pendingOrders: number;
  recentActivity: {
    newUsers: number;
    newBids: number;
    completedOrders: number;
  };
}

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}
