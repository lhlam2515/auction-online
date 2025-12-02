import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  // Auth types
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  GoogleLoginRequest,

  // User types
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpgradeRequestData,
  PublicProfile,
  UserRatingSummary,

  // Product types
  Product,
  CreateProductRequest,
  UpdateDescriptionRequest,
  ProductSearchParams,
  ProductImage,
  ProductDescriptionUpdate,

  // Category types
  Category,

  // Bid types
  Bid,
  PlaceBidRequest,
  CreateAutoBidRequest,
  UpdateAutoBidRequest,
  AutoBid,
  KickBidderRequest,

  // Question types
  Question,
  AskQuestionRequest,
  AnswerQuestionRequest,

  // Chat types
  ChatMessage,
  SendMessageRequest,

  // Order types
  Order,
  OrderFeedback,
  MarkPaidRequest,
  UpdatePaymentRequest,
  ShipOrderRequest,

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
} from "@repo/shared-types";
import { appendQueryParams } from "@/lib/url";

// Helper to convert typed params to generic record
const paramsToRecord = (
  params?: any
): Record<string, string | number | boolean | undefined | null> | undefined => {
  if (!params) return undefined;
  return params as Record<string, string | number | boolean | undefined | null>;
};

// Generic API call wrapper
const apiCall = async <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any,
  config?: any
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
     * Register a new user account
     */
    register: (data: RegisterRequest) =>
      apiCall<{ message: string }>("POST", API_ENDPOINTS.auth.register, data),

    /**
     * User login
     */
    login: (data: LoginRequest) =>
      apiCall<LoginResponse>("POST", API_ENDPOINTS.auth.login, data),

    /**
     * User logout
     */
    logout: () =>
      apiCall<{ message: string }>("POST", API_ENDPOINTS.auth.logout),

    /**
     * Refresh authentication token
     */
    refreshToken: () =>
      apiCall<LoginResponse>("POST", API_ENDPOINTS.auth.refreshToken),

    /**
     * Request password reset
     */
    forgotPassword: (data: ForgotPasswordRequest) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.auth.forgotPassword,
        data
      ),

    /**
     * Verify OTP for password reset
     */
    verifyOtp: (data: VerifyOtpRequest) =>
      apiCall<{ message: string }>("POST", API_ENDPOINTS.auth.verifyOtp, data),

    /**
     * Reset password with new password
     */
    resetPassword: (data: ResetPasswordRequest) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.auth.resetPassword,
        data
      ),

    /**
     * Google OAuth login
     */
    googleLogin: (data: GoogleLoginRequest) =>
      apiCall<LoginResponse>("POST", API_ENDPOINTS.auth.googleLogin, data),

    /**
     * Verify email address
     */
    verifyEmail: (data: VerifyEmailRequest) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.auth.verifyEmail,
        data
      ),

    /**
     * Resend email verification
     */
    resendVerification: (data: ResendVerificationRequest) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.auth.resendVerification,
        data
      ),
  },

  /**
   * User & Account management endpoints
   */
  users: {
    /**
     * Get current user profile
     */
    getProfile: () => apiCall<User>("GET", API_ENDPOINTS.user.profile),

    /**
     * Update user profile
     */
    updateProfile: (data: UpdateProfileRequest) =>
      apiCall<User>("PUT", API_ENDPOINTS.user.profile, data),

    /**
     * Change user password
     */
    changePassword: (data: ChangePasswordRequest) =>
      apiCall<{ message: string }>(
        "PATCH",
        API_ENDPOINTS.user.changePassword,
        data
      ),

    /**
     * Get public profile of another user
     */
    getPublicProfile: (userId: string) =>
      apiCall<PublicProfile>("GET", API_ENDPOINTS.user.publicProfile(userId)),

    /**
     * Get user rating summary
     */
    getRatingSummary: (userId: string) =>
      apiCall<UserRatingSummary>(
        "GET",
        API_ENDPOINTS.user.ratingSummary(userId)
      ),

    /**
     * Get user's watchlist
     */
    getWatchlist: (params?: PaginationParams) =>
      apiCall<PaginatedResponse<Product>>(
        "GET",
        appendQueryParams(API_ENDPOINTS.user.watchlist, paramsToRecord(params))
      ),

    /**
     * Add/Remove product from watchlist
     */
    toggleWatchlist: (productId: string) =>
      apiCall<{ message: string; inWatchlist: boolean }>(
        "POST",
        API_ENDPOINTS.user.toggleWatchlist(productId)
      ),

    /**
     * Get user's bidding history
     */
    getBids: (params?: PaginationParams) =>
      apiCall<PaginatedResponse<Bid>>(
        "GET",
        appendQueryParams(API_ENDPOINTS.user.bids, paramsToRecord(params))
      ),

    /**
     * Request upgrade to seller account
     */
    requestSellerUpgrade: (data: UpgradeRequestData) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.user.upgradeRequest,
        data
      ),
  },

  /**
   * Categories management endpoints
   */
  categories: {
    /**
     * Get category tree/hierarchy
     */
    getAll: () => apiCall<Category[]>("GET", API_ENDPOINTS.category.list),

    /**
     * Get products in a specific category
     */
    getProducts: (categoryId: string, params?: ProductSearchParams) =>
      apiCall<PaginatedResponse<Product>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.category.products(categoryId),
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
    search: (params?: ProductSearchParams) =>
      apiCall<PaginatedResponse<Product>>(
        "GET",
        appendQueryParams(API_ENDPOINTS.product.search, paramsToRecord(params))
      ),

    /**
     * Get top listings (ending soon, hot products, etc.)
     */
    getTopListing: (params?: {
      type?: "ending" | "hot" | "new";
      limit?: number;
    }) =>
      apiCall<Product[]>(
        "GET",
        appendQueryParams(API_ENDPOINTS.product.topListing, params)
      ),

    /**
     * Get product details
     */
    getById: (productId: string) =>
      apiCall<Product>("GET", API_ENDPOINTS.product.detail(productId)),

    /**
     * Get related products
     */
    getRelated: (productId: string, params?: { limit?: number }) =>
      apiCall<Product[]>(
        "GET",
        appendQueryParams(API_ENDPOINTS.product.related(productId), params)
      ),

    /**
     * Get product images
     */
    getImages: (productId: string) =>
      apiCall<ProductImage[]>("GET", API_ENDPOINTS.product.images(productId)),

    /**
     * Get product description update history
     */
    getDescriptionUpdates: (productId: string) =>
      apiCall<ProductDescriptionUpdate[]>(
        "GET",
        API_ENDPOINTS.product.descriptionUpdates(productId)
      ),

    /**
     * Create new product listing (Seller only)
     */
    create: (data: CreateProductRequest) =>
      apiCall<Product>("POST", API_ENDPOINTS.product.create, data),

    /**
     * Delete product (before activation)
     */
    delete: (productId: string) =>
      apiCall<{ message: string }>(
        "DELETE",
        API_ENDPOINTS.product.delete(productId)
      ),

    /**
     * Update product description (append only)
     */
    updateDescription: (productId: string, data: UpdateDescriptionRequest) =>
      apiCall<Product>(
        "PATCH",
        API_ENDPOINTS.product.updateDescription(productId),
        data
      ),

    /**
     * Enable/disable auto-extension
     */
    toggleAutoExtend: (productId: string, autoExtend: boolean) =>
      apiCall<Product>(
        "PUT",
        API_ENDPOINTS.product.toggleAutoExtend(productId),
        {
          autoExtend,
        }
      ),

    /**
     * Upload product images
     */
    uploadImages: (formData: FormData) =>
      apiCall<{ urls: string[]; message: string }>(
        "POST",
        API_ENDPOINTS.product.upload,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ),
  },

  /**
   * Seller-specific endpoints
   */
  seller: {
    /**
     * Get seller's own products
     */
    getProducts: (
      params?: ProductSearchParams & { status?: "draft" | "active" | "ended" }
    ) =>
      apiCall<PaginatedResponse<Product>>(
        "GET",
        appendQueryParams(API_ENDPOINTS.seller.products, paramsToRecord(params))
      ),

    /**
     * Get seller's order history
     */
    getOrders: (params?: PaginationParams & { status?: string }) =>
      apiCall<PaginatedResponse<Order>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.order.sellingOrders,
          paramsToRecord(params)
        )
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
      apiCall<PaginatedResponse<Bid>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.bid.history(productId),
          paramsToRecord(params)
        )
      ),

    /**
     * Place a bid on a product
     */
    placeBid: (productId: string, data: PlaceBidRequest) =>
      apiCall<{ message: string; currentHighestBid: number }>(
        "POST",
        API_ENDPOINTS.bid.placeBid(productId),
        data
      ),

    /**
     * Kick a bidder (Seller only)
     */
    kickBidder: (productId: string, data: KickBidderRequest) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.bid.kickBidder(productId),
        data
      ),

    /**
     * Create auto-bid configuration
     */
    createAutoBid: (productId: string, data: CreateAutoBidRequest) =>
      apiCall<AutoBid>(
        "POST",
        API_ENDPOINTS.bid.createAutoBid(productId),
        data
      ),

    /**
     * Get user's auto-bid for a product
     */
    getAutoBid: (productId: string) =>
      apiCall<AutoBid>("GET", API_ENDPOINTS.bid.getAutoBid(productId)),

    /**
     * Update auto-bid configuration
     */
    updateAutoBid: (autoBidId: string, data: UpdateAutoBidRequest) =>
      apiCall<AutoBid>("PUT", API_ENDPOINTS.bid.updateAutoBid(autoBidId), data),

    /**
     * Delete auto-bid configuration
     */
    deleteAutoBid: (autoBidId: string) =>
      apiCall<{ message: string }>(
        "DELETE",
        API_ENDPOINTS.bid.deleteAutoBid(autoBidId)
      ),
  },

  /**
   * Questions & Answers endpoints
   */
  questions: {
    /**
     * Get public Q&A for a product
     */
    getPublic: (productId: string, params?: PaginationParams) =>
      apiCall<PaginatedResponse<Question>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.question.public(productId),
          paramsToRecord(params)
        )
      ),

    /**
     * Get private questions for seller
     */
    getPrivate: (productId: string, params?: PaginationParams) =>
      apiCall<PaginatedResponse<Question>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.question.private(productId),
          paramsToRecord(params)
        )
      ),

    /**
     * Ask a question about a product
     */
    ask: (productId: string, data: AskQuestionRequest) =>
      apiCall<Question>("POST", API_ENDPOINTS.question.ask(productId), data),

    /**
     * Answer a question (Seller only)
     */
    answer: (questionId: string, data: AnswerQuestionRequest) =>
      apiCall<Question>(
        "POST",
        API_ENDPOINTS.question.answer(questionId),
        data
      ),
  },

  /**
   * Chat (Winner ↔ Seller) endpoints
   */
  chat: {
    /**
     * Get chat history for an order
     */
    getHistory: (orderId: string, params?: PaginationParams) =>
      apiCall<PaginatedResponse<ChatMessage>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.chat.history(orderId),
          paramsToRecord(params)
        )
      ),

    /**
     * Send a message in order chat
     */
    sendMessage: (orderId: string, data: SendMessageRequest) =>
      apiCall<ChatMessage>(
        "POST",
        API_ENDPOINTS.chat.sendMessage(orderId),
        data
      ),

    /**
     * Mark message as read
     */
    markMessageRead: (messageId: string) =>
      apiCall<{ message: string }>(
        "PUT",
        API_ENDPOINTS.chat.markRead(messageId)
      ),

    /**
     * Get unread message count
     */
    getUnreadCount: () =>
      apiCall<{ count: number }>("GET", API_ENDPOINTS.chat.unreadCount),
  },

  /**
   * Orders & Post-Auction Workflow endpoints
   */
  orders: {
    /**
     * Get user's orders
     */
    getAll: (
      params?: PaginationParams & { status?: string; role?: "buyer" | "seller" }
    ) =>
      apiCall<PaginatedResponse<Order>>(
        "GET",
        appendQueryParams(API_ENDPOINTS.order.list, paramsToRecord(params))
      ),

    /**
     * Get order details
     */
    getById: (orderId: string) =>
      apiCall<Order>("GET", API_ENDPOINTS.order.detail(orderId)),

    /**
     * Mark order as paid (Buyer)
     */
    markPaid: (orderId: string, data: MarkPaidRequest) =>
      apiCall<Order>("POST", API_ENDPOINTS.order.markPaid(orderId), data),

    /**
     * Update payment information
     */
    updatePayment: (orderId: string, data: UpdatePaymentRequest) =>
      apiCall<Order>("POST", API_ENDPOINTS.order.updatePayment(orderId), data),

    /**
     * Mark order as shipped (Seller)
     */
    ship: (orderId: string, data: ShipOrderRequest) =>
      apiCall<Order>("POST", API_ENDPOINTS.order.ship(orderId), data),

    /**
     * Confirm order received (Buyer)
     */
    confirmReceived: (orderId: string) =>
      apiCall<Order>("POST", API_ENDPOINTS.order.receive(orderId)),

    /**
     * Cancel order
     */
    cancel: (orderId: string, data?: { reason?: string }) =>
      apiCall<Order>("POST", API_ENDPOINTS.order.cancel(orderId), data),

    /**
     * Submit feedback after transaction
     */
    submitFeedback: (orderId: string, data: OrderFeedback) =>
      apiCall<{ message: string }>(
        "POST",
        API_ENDPOINTS.order.feedback(orderId),
        data
      ),
  },

  /**
   * Rating System endpoints
   */
  ratings: {
    /**
     * Create a rating
     */
    create: (data: CreateRatingRequest) =>
      apiCall<Rating>("POST", API_ENDPOINTS.rating.create, data),

    /**
     * Get user's rating history
     */
    getByUser: (userId: string, params?: PaginationParams) =>
      apiCall<PaginatedResponse<Rating>>(
        "GET",
        appendQueryParams(
          API_ENDPOINTS.rating.list(userId),
          paramsToRecord(params)
        )
      ),

    /**
     * Get user's rating summary
     */
    getSummary: (userId: string) =>
      apiCall<RatingSummary>("GET", API_ENDPOINTS.rating.summary(userId)),
  },

  /**
   * Admin Management endpoints
   */
  admin: {
    /**
     * Get admin dashboard statistics
     */
    getStats: () => apiCall<AdminStats>("GET", API_ENDPOINTS.admin.stats),

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
          appendQueryParams(API_ENDPOINTS.admin.users, paramsToRecord(params))
        ),

      /**
       * Ban/unban user
       */
      ban: (userId: string, data: BanUserRequest) =>
        apiCall<{ message: string }>(
          "PATCH",
          API_ENDPOINTS.admin.banUser(userId),
          data
        ),

      /**
       * Reset user password
       */
      resetPassword: (userId: string, data: ResetUserPasswordRequest) =>
        apiCall<{ message: string }>(
          "POST",
          API_ENDPOINTS.admin.resetUserPassword(userId),
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
          appendQueryParams(
            API_ENDPOINTS.admin.upgrades,
            paramsToRecord(params)
          )
        ),

      /**
       * Approve upgrade request
       */
      approve: (upgradeId: string) =>
        apiCall<{ message: string }>(
          "POST",
          API_ENDPOINTS.admin.approveUpgrade(upgradeId)
        ),

      /**
       * Reject upgrade request
       */
      reject: (upgradeId: string, data?: { reason?: string }) =>
        apiCall<{ message: string }>(
          "POST",
          API_ENDPOINTS.admin.rejectUpgrade(upgradeId),
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
          appendQueryParams(
            API_ENDPOINTS.admin.products,
            paramsToRecord(params)
          )
        ),

      /**
       * Get pending products for approval
       */
      getPending: (params?: PaginationParams) =>
        apiCall<PaginatedResponse<AdminProduct>>(
          "GET",
          appendQueryParams(
            API_ENDPOINTS.admin.pendingProducts,
            paramsToRecord(params)
          )
        ),

      /**
       * Approve product
       */
      approve: (productId: string) =>
        apiCall<{ message: string }>(
          "PUT",
          API_ENDPOINTS.admin.approveProduct(productId)
        ),

      /**
       * Reject product
       */
      reject: (productId: string, data?: { reason?: string }) =>
        apiCall<{ message: string }>(
          "PUT",
          API_ENDPOINTS.admin.rejectProduct(productId),
          data
        ),

      /**
       * Suspend active product
       */
      suspend: (productId: string, data?: { reason?: string }) =>
        apiCall<{ message: string }>(
          "POST",
          API_ENDPOINTS.admin.suspendProduct(productId),
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
      }) => apiCall<Category>("POST", API_ENDPOINTS.admin.createCategory, data),

      /**
       * Update category
       */
      update: (
        categoryId: string,
        data: { name?: string; description?: string }
      ) =>
        apiCall<Category>(
          "PUT",
          API_ENDPOINTS.admin.updateCategory(categoryId),
          data
        ),

      /**
       * Delete category
       */
      delete: (categoryId: string) =>
        apiCall<{ message: string }>(
          "DELETE",
          API_ENDPOINTS.admin.deleteCategory(categoryId)
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
