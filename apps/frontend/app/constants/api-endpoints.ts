export const API_ENDPOINTS = {
  // ===== AUTH =====
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    forgotPassword: "/auth/forgot-password",
    verifyOtp: "/auth/verify-otp",
    resetPassword: "/auth/reset-password",
    googleLogin: "/auth/google",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
  },

  // ===== USER =====
  user: {
    profile: "/users/profile",
    publicProfile: (userId: string) => `/users/${userId}/public-profile`,
    ratingSummary: (userId: string) => `/users/${userId}/rating-summary`,
    changePassword: "/users/password",
    watchlist: "/users/watchlist",
    toggleWatchlist: (productId: string) => `/users/watchlist/${productId}`,
    bids: "/users/bids",
    upgradeRequest: "/users/upgrade-request",
  },

  // ===== CATEGORIES =====
  category: {
    list: "/categories",
    products: (categoryId: string) => `/categories/${categoryId}/products`,
  },

  // ===== PRODUCTS =====
  product: {
    search: "/products",
    topListing: "/products/top-listing",
    detail: (productId: string) => `/products/${productId}`,
    related: (productId: string) => `/products/${productId}/related`,
    images: (productId: string) => `/products/${productId}/images`,
    descriptionUpdates: (productId: string) =>
      `/products/${productId}/description-updates`,
    create: "/products",
    delete: (productId: string) => `/products/${productId}`,
    updateDescription: (productId: string) =>
      `/products/${productId}/description`,
    toggleAutoExtend: (productId: string) =>
      `/products/${productId}/auto-extend`,
    upload: "/upload",
  },

  // ===== SELLER =====
  seller: {
    products: "/seller/products",
  },

  // ===== BIDDING =====
  bid: {
    history: (productId: string) => `/products/${productId}/bids`,
    placeBid: (productId: string) => `/products/${productId}/bids`,
    kickBidder: (productId: string) => `/products/${productId}/kick`,
    createAutoBid: (productId: string) => `/products/${productId}/auto-bid`,
    getAutoBid: (productId: string) => `/products/${productId}/auto-bid`,
    updateAutoBid: (autoBidId: string) => `/auto-bid/${autoBidId}`,
    deleteAutoBid: (autoBidId: string) => `/auto-bid/${autoBidId}`,
  },

  // ===== QUESTIONS =====
  question: {
    public: (productId: string) => `/products/${productId}/questions`,
    private: (productId: string) => `/products/${productId}/questions/private`,
    ask: (productId: string) => `/products/${productId}/questions`,
    answer: (questionId: string) => `/questions/${questionId}/answer`,
  },

  // ===== CHAT =====
  chat: {
    history: (orderId: string) => `/orders/${orderId}/chat`,
    sendMessage: (orderId: string) => `/orders/${orderId}/chat`,
    markRead: (messageId: string) => `/chat/messages/${messageId}/read`,
    unreadCount: "/chat/unread-count",
  },

  // ===== ORDERS =====
  order: {
    list: "/orders",
    detail: (orderId: string) => `/orders/${orderId}`,
    markPaid: (orderId: string) => `/orders/${orderId}/mark-paid`,
    updatePayment: (orderId: string) => `/orders/${orderId}/payment`,
    ship: (orderId: string) => `/orders/${orderId}/ship`,
    receive: (orderId: string) => `/orders/${orderId}/receive`,
    cancel: (orderId: string) => `/orders/${orderId}/cancel`,
    sellingOrders: "/users/selling-orders",
    feedback: (orderId: string) => `/orders/${orderId}/feedback`,
  },

  // ===== RATINGS =====
  rating: {
    create: "/ratings",
    list: (userId: string) => `/ratings/${userId}`,
    summary: (userId: string) => `/ratings/${userId}/summary`,
  },

  // ===== ADMIN =====
  admin: {
    stats: "/admin/stats",
    users: "/admin/users",
    banUser: (userId: string) => `/admin/users/${userId}/ban`,
    resetUserPassword: (userId: string) =>
      `/admin/users/${userId}/reset-password`,
    upgrades: "/admin/upgrades",
    approveUpgrade: (upgradeId: string) =>
      `/admin/upgrades/${upgradeId}/approve`,
    rejectUpgrade: (upgradeId: string) => `/admin/upgrades/${upgradeId}/reject`,
    products: "/admin/products",
    pendingProducts: "/admin/products/pending",
    approveProduct: (productId: string) =>
      `/admin/products/${productId}/approve`,
    rejectProduct: (productId: string) => `/admin/products/${productId}/reject`,
    suspendProduct: (productId: string) =>
      `/admin/products/${productId}/suspend`,
    categories: "/admin/categories",
    createCategory: "/admin/categories",
    updateCategory: (categoryId: string) => `/admin/categories/${categoryId}`,
    deleteCategory: (categoryId: string) => `/admin/categories/${categoryId}`,
  },
} as const;
