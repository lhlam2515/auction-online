import type {
  // Auth types
  UserAuthData,
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  VerifyOtpResponse,
  VerifyResetOtpRequest,

  // User types
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpgradeRequestData,
  PublicProfile,
  UserRatingSummary,

  // Product types
  Product,
  ProductListing,
  CreateProductRequest,
  UpdateDescriptionRequest,
  TopListingResponse,
  ProductImage,
  UpdateDescriptionResponse,
  UploadImagesResponse,

  // Category types
  Category,
  CategoryTree,
  GetCategoryProductsParams,

  // Bid types
  Bid,
  PlaceBidRequest,
  CreateAutoBidRequest,
  UpdateAutoBidRequest,
  AutoBid,
  KickBidderRequest,

  // Question types
  ProductQuestion,
  AskQuestionRequest,
  AnswerQuestionRequest,

  // Chat types
  ChatMessage,
  SendMessageRequest,
  UnreadCountResponse,

  // Order types
  Order,
  OrderPayment,
  CreateOrderRequest,
  GetOrdersParams,
  UpdateShippingInfoRequest,
  OrderFeedbackRequest,
  MarkPaidRequest,
  ShipOrderRequest,

  // Seller types
  GetSellerProductsParams,
  GetSellerOrdersParams,

  // Rating types
  CreateRatingRequest,
  Rating,
  RatingSummary,

  // Admin types
  AdminStats,
  AdminUser,
  BanUserRequest,
  ResetUserPasswordRequest,
  UpgradeRequest,
  AdminProduct,

  // Common types
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SearchProductsParams,
  OrderWithDetails,
} from "@repo/shared-types";

import { apiClient } from "@/lib/handlers/api";
import { appendQueryParams } from "@/lib/url";

// Helper to convert typed params to generic record
const paramsToRecord = (
  params?: unknown
): Record<string, string | number | boolean | undefined | null> | undefined => {
  if (!params) return undefined;
  return params as Record<string, string | number | boolean | undefined | null>;
};

// Generic API call wrapper
const apiCall = async <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: unknown,
  config?: Record<string, unknown>
) => {
  const response = await apiClient<ApiResponse<T>>({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
};

export const api = {
  /**
   * Authentication & Authorization endpoints
   */
  auth: {
    /**
     * Get current authenticated user
     */
    me: () => apiCall<{ user: UserAuthData }>("GET", "/auth/me"),
    /**
     * Register a new user account
     */
    register: (data: RegisterRequest) =>
      apiCall("POST", "/auth/register", data),

    /**
     * User login
     */
    login: (data: LoginRequest) =>
      apiCall<{ user: UserAuthData }>("POST", "/auth/login", data),

    /**
     * User logout
     */
    logout: () => apiCall("POST", "/auth/logout"),

    /**
     * Refresh authentication token
     */
    refreshToken: () => apiCall("POST", "/auth/refresh-token"),

    /**
     * Request password reset
     */
    forgotPassword: (data: ForgotPasswordRequest) =>
      apiCall("POST", "/auth/forgot-password", data),

    /**
     * Verify OTP for password reset
     */
    verifyOtp: (data: VerifyResetOtpRequest) =>
      apiCall<VerifyOtpResponse>("POST", "/auth/verify-reset-otp", data),

    /**
     * Reset password with new password
     */
    resetPassword: (data: ResetPasswordRequest) =>
      apiCall("POST", "/auth/reset-password", data),

    /**
     * Verify email address
     */
    verifyEmail: (data: VerifyEmailRequest) =>
      apiCall("POST", "/auth/verify-email", data),

    /**
     * Resend verification OTP
     */
    resendOtp: (data: ResendOtpRequest) =>
      apiCall("POST", "/auth/resend-otp", data),
  },

  /**
   * User & Account management endpoints
   */
  users: {
    /**
     * Get current user profile
     */
    getProfile: () => apiCall<User>("GET", "/users/profile"),

    /**
     * Update user profile
     */
    updateProfile: (data: UpdateProfileRequest) =>
      apiCall<User>("PUT", "/users/profile", data),

    /**
     * Change user password
     */
    changePassword: (data: ChangePasswordRequest) =>
      apiCall<{ message: string }>("PATCH", "/users/password", data),

    /**
     * Get public profile of another user
     */
    getPublicProfile: (userId: string) =>
      apiCall<PublicProfile>("GET", `/users/${userId}/public-profile`),

    /**
     * Get user rating summary
     */
    getRatingSummary: (userId: string) =>
      apiCall<UserRatingSummary>("GET", `/users/${userId}/rating-summary`),

    /**
     * Get user's watchlist
     */
    getWatchlist: (params?: PaginationParams) =>
      apiCall<PaginatedResponse<Product>>(
        "GET",
        appendQueryParams("/users/watchlist", paramsToRecord(params))
      ),

    /**
     * Add/Remove product from watchlist
     */
    toggleWatchlist: (productId: string) =>
      apiCall<{ message: string; inWatchlist: boolean }>(
        "POST",
        `/users/watchlist/${productId}`
      ),

    /**
     * Get user's bidding history
     */
    getBids: (params?: PaginationParams) =>
      apiCall<PaginatedResponse<Bid>>(
        "GET",
        appendQueryParams("/users/bids", paramsToRecord(params))
      ),

    /**
     * Request upgrade to seller account
     */
    requestSellerUpgrade: (data: UpgradeRequestData) =>
      apiCall<{ message: string }>("POST", "/users/upgrade-request", data),
  },

  /**
   * Categories management endpoints
   */
  categories: {
    /**
     * Get category tree/hierarchy
     */
    getAll: () => apiCall<CategoryTree[]>("GET", "/categories"),

    /**
     * Get products in a specific category
     */
    getProducts: (categoryId: string, params?: GetCategoryProductsParams) =>
      apiCall<PaginatedResponse<Product>>(
        "GET",
        appendQueryParams(
          `/categories/${categoryId}/products`,
          paramsToRecord(params)
        )
      ),
  },

  /**
   * Products (Public & Seller) endpoints
   */
  products: {
    /**
     * Search and filter products
     */
    search: (params?: SearchProductsParams) =>
      apiCall<PaginatedResponse<ProductListing>>(
        "GET",
        appendQueryParams("/products", paramsToRecord(params))
      ),

    /**
     * Get top listings (ending soon, hot products, etc.)
     */
    getTopListing: (params?: { limit?: number }) =>
      apiCall<TopListingResponse>(
        "GET",
        appendQueryParams("/products/top-listing", params)
      ),

    /**
     * Get product details
     */
    getById: (productId: string) =>
      apiCall<Product>("GET", `/products/${productId}`),

    /**
     * Get related products
     */
    getRelated: (productId: string, params?: { limit?: number }) =>
      apiCall<ProductListing[]>(
        "GET",
        appendQueryParams(`/products/${productId}/related`, params)
      ),

    /**
     * Get product images
     */
    getImages: (productId: string) =>
      apiCall<ProductImage[]>("GET", `/products/${productId}/images`),

    /**
     * Get product description update history
     */
    getDescriptionUpdates: (productId: string) =>
      apiCall<UpdateDescriptionResponse[]>(
        "GET",
        `/products/${productId}/description-updates`
      ),

    /**
     * Create new product listing (Seller only)
     */
    create: (data: CreateProductRequest) =>
      apiCall<Product>("POST", "/products", data),

    /**
     * Delete product (before activation)
     */
    delete: (productId: string) => apiCall("DELETE", `/products/${productId}`),

    /**
     * Update product description (append only)
     */
    updateDescription: (productId: string, data: UpdateDescriptionRequest) =>
      apiCall<UpdateDescriptionResponse>(
        "PATCH",
        `/products/${productId}/description`,
        data
      ),

    /**
     * Enable/disable auto-extension
     */
    toggleAutoExtend: (productId: string, autoExtend: boolean) =>
      apiCall("PUT", `/products/${productId}/auto-extend`, {
        autoExtend,
      }),

    /**
     * Upload product images
     */
    uploadImages: (formData: FormData) =>
      apiCall<UploadImagesResponse>("POST", "/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  /**
   * Seller-specific endpoints
   */
  seller: {
    /**
     * Get seller's own products
     */
    getProducts: (params?: GetSellerProductsParams) =>
      apiCall<PaginatedResponse<ProductListing>>(
        "GET",
        appendQueryParams("/seller/products", paramsToRecord(params))
      ),

    /**
     * Get seller's order history
     */
    getOrders: (params?: GetSellerOrdersParams) =>
      apiCall<PaginatedResponse<Order>>(
        "GET",
        appendQueryParams("/seller/selling-orders", paramsToRecord(params))
      ),
  },

  /**
   * Bidding & Auction endpoints
   */
  bids: {
    /**
     * Get bidding history for a product
     */
    getHistory: (productId: string, params?: PaginationParams) =>
      apiCall<Bid[]>(
        "GET",
        appendQueryParams(`/products/${productId}/bids`, paramsToRecord(params))
      ),

    /**
     * Place a bid on a product
     */
    placeBid: (productId: string, data: PlaceBidRequest) =>
      apiCall<Bid>("POST", `/products/${productId}/bids`, data),

    /**
     * Kick a bidder (Seller only)
     */
    kickBidder: (productId: string, data: KickBidderRequest) =>
      apiCall<{ message: string }>("POST", `/products/${productId}/kick`, data),

    /**
     * Create auto-bid configuration
     */
    createAutoBid: (productId: string, data: CreateAutoBidRequest) =>
      apiCall<AutoBid>("POST", `/products/${productId}/auto-bid`, data),

    /**
     * Get user's auto-bid for a product
     */
    getAutoBid: (productId: string) =>
      apiCall<AutoBid>("GET", `/products/${productId}/auto-bid`),

    /**
     * Update auto-bid configuration
     */
    updateAutoBid: (autoBidId: string, data: UpdateAutoBidRequest) =>
      apiCall<{ message: string }>("PUT", `/auto-bid/${autoBidId}`, data),

    /**
     * Delete auto-bid configuration
     */
    deleteAutoBid: (autoBidId: string) =>
      apiCall<{ message: string }>("DELETE", `/auto-bid/${autoBidId}`),
  },

  /**
   * Questions & Answers endpoints
   */
  questions: {
    /**
     * Get public Q&A for a product
     */
    getPublic: (productId: string) =>
      apiCall<ProductQuestion[]>("GET", `/products/${productId}/questions`),

    /**
     * Ask a question about a product
     */
    ask: (productId: string, data: AskQuestionRequest) =>
      apiCall<ProductQuestion>(
        "POST",
        `/products/${productId}/questions`,
        data
      ),

    /**
     * Answer a question (Seller only)
     */
    answer: (questionId: string, data: AnswerQuestionRequest) =>
      apiCall<ProductQuestion>("POST", `/questions/${questionId}/answer`, data),
  },

  /**
   * Chat (Winner ↔ Seller) endpoints
   */
  chat: {
    /**
     * Get chat history for an order
     */
    getHistory: (orderId: string, params?: PaginationParams) =>
      apiCall<ChatMessage[]>(
        "GET",
        appendQueryParams(`/orders/${orderId}/chat`, paramsToRecord(params))
      ),

    /**
     * Send a message in order chat
     */
    sendMessage: (orderId: string, data: SendMessageRequest) =>
      apiCall<ChatMessage>("POST", `/orders/${orderId}/chat`, data),

    /**
     * Mark message as read
     */
    markMessageRead: (messageId: string) =>
      apiCall<{ message: string }>("PUT", `/orders/messages/${messageId}/read`),

    /**
     * Get unread message count
     */
    getUnreadCount: () =>
      apiCall<UnreadCountResponse>("GET", "/orders/messages/unread-count"),
  },

  /**
   * Orders & Post-Auction Workflow endpoints
   */
  orders: {
    /**
     * Create order (Instant Buy Now)
     */
    create: (data: CreateOrderRequest) =>
      apiCall<Order>("POST", "/orders", data),

    /**
     * Get user's orders
     */
    getAll: (params?: GetOrdersParams) =>
      apiCall<PaginatedResponse<OrderWithDetails>>(
        "GET",
        appendQueryParams("/orders", paramsToRecord(params))
      ),

    /**
     * Get order details
     */
    getById: (orderId: string) =>
      apiCall<OrderWithDetails>("GET", `/orders/${orderId}`),

    /**
     * Update shipping address (Buyer)
     */
    updateShipping: (orderId: string, data: UpdateShippingInfoRequest) =>
      apiCall<Order>("POST", `/orders/${orderId}/shipping`, data),

    /**
     * Mark order as paid (Buyer)
     */
    markPaid: (orderId: string, data: MarkPaidRequest) =>
      apiCall<{ order: Order; payment: OrderPayment }>(
        "POST",
        `/orders/${orderId}/mark-paid`,
        data
      ),

    /**
     * Confirm payment received (Seller)
     */
    confirmPayment: (orderId: string) =>
      apiCall<Order>("POST", `/orders/${orderId}/confirm-payment`),

    /**
     * Mark order as shipped (Seller)
     */
    ship: (orderId: string, data: ShipOrderRequest) =>
      apiCall<Order>("POST", `/orders/${orderId}/ship`, data),

    /**
     * Confirm order received (Buyer)
     */
    confirmReceived: (orderId: string) =>
      apiCall<Order>("POST", `/orders/${orderId}/receive`),

    /**
     * Cancel order
     */
    cancel: (orderId: string, data?: { reason?: string }) =>
      apiCall<Order>("POST", `/orders/${orderId}/cancel`, data),

    /**
     * Submit feedback after transaction
     */
    submitFeedback: (orderId: string, data: OrderFeedbackRequest) =>
      apiCall<Rating>("POST", `/orders/${orderId}/feedback`, data),
  },

  /**
   * Rating System endpoints
   */
  ratings: {
    /**
     * Create a rating
     */
    create: (data: CreateRatingRequest) =>
      apiCall<Rating>("POST", "/ratings", data),

    /**
     * Get user's rating history
     */
    getByUser: (userId: string, params?: PaginationParams) =>
      apiCall<PaginatedResponse<Rating>>(
        "GET",
        appendQueryParams(`/ratings/${userId}`, paramsToRecord(params))
      ),

    /**
     * Get user's rating summary
     */
    getSummary: (userId: string) =>
      apiCall<RatingSummary>("GET", `/ratings/${userId}/summary`),
  },

  /**
   * Admin Management endpoints
   */
  admin: {
    /**
     * Get admin dashboard statistics
     */
    getStats: () => apiCall<AdminStats>("GET", "/admin/stats"),

    /**
     * User Management
     */
    users: {
      /**
       * Get all users with filters
       */
      getAll: (
        params?: PaginationParams & {
          status?: string;
          role?: string;
          search?: string;
        }
      ) =>
        apiCall<PaginatedResponse<AdminUser>>(
          "GET",
          appendQueryParams("/admin/users", paramsToRecord(params))
        ),

      /**
       * Ban/unban user
       */
      ban: (userId: string, data: BanUserRequest) =>
        apiCall<{ message: string }>(
          "PATCH",
          `/admin/users/${userId}/ban`,
          data
        ),

      /**
       * Reset user password
       */
      resetPassword: (userId: string, data: ResetUserPasswordRequest) =>
        apiCall<{ message: string }>(
          "POST",
          `/admin/users/${userId}/reset-password`,
          data
        ),
    },

    /**
     * Seller Upgrade Requests
     */
    upgrades: {
      /**
       * Get all upgrade requests
       */
      getAll: (
        params?: PaginationParams & {
          status?: "pending" | "approved" | "rejected";
        }
      ) =>
        apiCall<PaginatedResponse<UpgradeRequest>>(
          "GET",
          appendQueryParams("/admin/upgrades", paramsToRecord(params))
        ),

      /**
       * Approve upgrade request
       */
      approve: (upgradeId: string) =>
        apiCall<{ message: string }>(
          "POST",
          `/admin/upgrades/${upgradeId}/approve`
        ),

      /**
       * Reject upgrade request
       */
      reject: (upgradeId: string, data?: { reason?: string }) =>
        apiCall<{ message: string }>(
          "POST",
          `/admin/upgrades/${upgradeId}/reject`,
          data
        ),
    },

    /**
     * Product Management
     */
    products: {
      /**
       * Get all products
       */
      getAll: (
        params?: PaginationParams & {
          status?: string;
          category?: string;
          search?: string;
        }
      ) =>
        apiCall<PaginatedResponse<AdminProduct>>(
          "GET",
          appendQueryParams("/admin/products", paramsToRecord(params))
        ),

      /**
       * Get pending products for approval
       */
      getPending: (params?: PaginationParams) =>
        apiCall<PaginatedResponse<AdminProduct>>(
          "GET",
          appendQueryParams("/admin/products/pending", paramsToRecord(params))
        ),

      /**
       * Approve product
       */
      approve: (productId: string) =>
        apiCall<{ message: string }>(
          "PUT",
          `/admin/products/${productId}/approve`
        ),

      /**
       * Reject product
       */
      reject: (productId: string, data?: { reason?: string }) =>
        apiCall<{ message: string }>(
          "PUT",
          `/admin/products/${productId}/reject`,
          data
        ),

      /**
       * Suspend active product
       */
      suspend: (productId: string, data?: { reason?: string }) =>
        apiCall<{ message: string }>(
          "POST",
          `/admin/products/${productId}/suspend`,
          data
        ),
    },

    /**
     * Category Management
     */
    categories: {
      /**
       * Create new category
       */
      create: (data: {
        name: string;
        description?: string;
        parentId?: string;
      }) => apiCall<Category>("POST", "/admin/categories", data),

      /**
       * Update category
       */
      update: (
        categoryId: string,
        data: { name?: string; description?: string }
      ) => apiCall<Category>("PUT", `/admin/categories/${categoryId}`, data),

      /**
       * Delete category
       */
      delete: (categoryId: string) =>
        apiCall<{ message: string }>(
          "DELETE",
          `/admin/categories/${categoryId}`
        ),
    },
  },
};

/**
 * Type-safe API client with comprehensive endpoint coverage
 *
 * Features:
 * - Full TypeScript integration with shared types
 * - Automatic token refresh and error handling
 * - Consistent response structure
 * - Query parameter handling
 * - Role-based endpoint organization
 * - File upload support
 *
 * Usage:
 * ```typescript
 * // Authentication
 * const response = await api.auth.login({ email: "user@example.com", password: "password" });
 *
 * // Product search with filters
 * const products = await api.products.search({
 *   category: "electronics",
 *   minPrice: 100,
 *   page: 1,
 *   limit: 20
 * });
 *
 * // Place a bid
 * await api.bids.placeBid("product-123", { amount: 150.00 });
 *
 * // Admin operations
 * await api.admin.products.approve("product-456");
 * ```
 */
export type ApiClient = typeof api;
