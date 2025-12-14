/**
 * Success API response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error API response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: any;
    stack?: string;
  };
}

/**
 *  Generic API response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

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
 * Timestamp fields matching backend models
 */
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

/**
 * Product search filters matching backend capabilities
 */
export interface ProductSearchFilters {
  categoryId?: string;
  minPrice?: string; // Decimal as string
  maxPrice?: string; // Decimal as string
  status?: string[];
  sellerId?: string;
  searchTerm?: string;
  sortBy?: "price_asc" | "price_desc" | "ending_soon" | "newest" | "most_bids";
  page?: number;
  limit?: number;
}

/**
 * Bid validation result
 */
export interface BidValidationResult {
  isValid: boolean;
  errors: string[];
  minimumBid?: string; // Decimal as string
  suggestedBid?: string; // Decimal as string
}

/**
 * Dashboard statistics with decimal amounts as strings
 */
export interface DashboardStats {
  totalUsers: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: string; // Decimal as string
  pendingOrders: number;
  recentActivity: {
    newUsers: number;
    newBids: number;
    completedOrders: number;
  };
}

/**
 * Notification entity for system messages
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
