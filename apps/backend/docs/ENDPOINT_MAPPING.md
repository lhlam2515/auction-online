# 📍 API Endpoint to File Mapping

Mapping giữa các endpoint trong FULL_API_ENDPOINTS.md và các file implementation.

---

## ✅ 1. Authentication & Authorization

| Endpoint                           | Route File     | Controller                          | Validation                                |
| ---------------------------------- | -------------- | ----------------------------------- | ----------------------------------------- |
| POST /api/v1/auth/register         | auth.routes.ts | auth.controller.ts → register       | auth.validation.ts → registerSchema       |
| POST /api/v1/auth/login            | auth.routes.ts | auth.controller.ts → login          | auth.validation.ts → loginSchema          |
| POST /api/v1/auth/logout           | auth.routes.ts | auth.controller.ts → logout         | -                                         |
| POST /api/v1/auth/refresh-token    | auth.routes.ts | auth.controller.ts → refreshToken   | -                                         |
| POST /api/v1/auth/forgot-password  | auth.routes.ts | auth.controller.ts → forgotPassword | auth.validation.ts → forgotPasswordSchema |
| POST /api/v1/auth/verify-email     | auth.routes.ts | auth.controller.ts → verifyEmail    | auth.validation.ts → verifyEmailSchema    |
| POST /api/v1/auth/verify-reset-otp | auth.routes.ts | auth.controller.ts → verifyResetOtp | auth.validation.ts → verifyResetOtpSchema |
| POST /api/v1/auth/reset-password   | auth.routes.ts | auth.controller.ts → resetPassword  | auth.validation.ts → resetPasswordSchema  |
| POST /api/v1/auth/google           | auth.routes.ts | auth.controller.ts → googleLogin    | -                                         |
| POST /api/v1/auth/resend-otp       | auth.routes.ts | auth.controller.ts → resendOtp      | auth.validation.ts → resendOtpSchema      |

---

## ✅ 2. User & Account

| Endpoint                                | Route File     | Controller                             | Validation                                |
| --------------------------------------- | -------------- | -------------------------------------- | ----------------------------------------- |
| GET /api/v1/users/profile               | user.routes.ts | user.controller.ts → getProfile        | -                                         |
| PUT /api/v1/users/profile               | user.routes.ts | user.controller.ts → updateProfile     | user.validation.ts → updateProfileSchema  |
| PATCH /api/v1/users/password            | user.routes.ts | user.controller.ts → changePassword    | user.validation.ts → changePasswordSchema |
| GET /api/v1/users/:id/public-profile    | user.routes.ts | user.controller.ts → getPublicProfile  | user.validation.ts → userIdSchema         |
| GET /api/v1/users/:id/rating-summary    | user.routes.ts | user.controller.ts → getRatingSummary  | user.validation.ts → userIdSchema         |
| POST /api/v1/users/watchlist/:productId | user.routes.ts | user.controller.ts → toggleWatchlist   | user.validation.ts → productIdSchema      |
| GET /api/v1/users/watchlist             | user.routes.ts | user.controller.ts → getWatchlist      | -                                         |
| GET /api/v1/users/bids                  | user.routes.ts | user.controller.ts → getBiddingHistory | user.validation.ts → paginationSchema     |
| POST /api/v1/users/upgrade-request      | user.routes.ts | user.controller.ts → requestUpgrade    | user.validation.ts → upgradeRequestSchema |

---

## ✅ 3. Categories

| Endpoint                            | Route File         | Controller                                     | Validation                                                   |
| ----------------------------------- | ------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| GET /api/v1/categories              | category.routes.ts | category.controller.ts → getCategories         | -                                                            |
| GET /api/v1/categories/:id/products | category.routes.ts | category.controller.ts → getProductsByCategory | category.validation.ts → categoryIdSchema, getProductsSchema |

---

## ✅ 4. Products (Public & Seller)

| Endpoint                                     | Route File        | Controller                                    | Validation                                      |
| -------------------------------------------- | ----------------- | --------------------------------------------- | ----------------------------------------------- |
| GET /api/v1/products                         | product.routes.ts | product.controller.ts → searchProducts        | product.validation.ts → searchProductsSchema    |
| GET /api/v1/products/top-listing             | product.routes.ts | product.controller.ts → getTopListing         | product.validation.ts → topListingSchema        |
| GET /api/v1/products/:id                     | product.routes.ts | product.controller.ts → getProductDetails     | product.validation.ts → productIdSchema         |
| GET /api/v1/products/:id/related             | product.routes.ts | product.controller.ts → getRelatedProducts    | product.validation.ts → productIdSchema         |
| GET /api/v1/products/:id/images              | product.routes.ts | product.controller.ts → getProductImages      | product.validation.ts → productIdSchema         |
| GET /api/v1/products/:id/description-updates | product.routes.ts | product.controller.ts → getDescriptionUpdates | product.validation.ts → productIdSchema         |
| POST /api/v1/products                        | product.routes.ts | product.controller.ts → createProduct         | product.validation.ts → createProductSchema     |
| DELETE /api/v1/products/:id                  | product.routes.ts | product.controller.ts → deleteProduct         | product.validation.ts → productIdSchema         |
| PATCH /api/v1/products/:id/description       | product.routes.ts | product.controller.ts → updateDescription     | product.validation.ts → updateDescriptionSchema |
| PUT /api/v1/products/:id/auto-extend         | product.routes.ts | product.controller.ts → toggleAutoExtend      | product.validation.ts → autoExtendSchema        |
| POST /api/v1/upload                          | product.routes.ts | product.controller.ts → uploadImages          | -                                               |
| GET /api/v1/seller/products                  | seller.routes.ts  | seller.controller.ts → getMyProducts          | seller.validation.ts → getProductsSchema        |

---

## ✅ 5. Bidding & Auction

| Endpoint                           | Route File    | Controller                            | Validation                                            |
| ---------------------------------- | ------------- | ------------------------------------- | ----------------------------------------------------- |
| GET /api/v1/products/:id/bids      | bid.routes.ts | bid.controller.ts → getBiddingHistory | bid.validation.ts → productIdSchema, paginationSchema |
| POST /api/v1/products/:id/bids     | bid.routes.ts | bid.controller.ts → placeBid          | bid.validation.ts → placeBidSchema                    |
| POST /api/v1/products/:id/kick     | bid.routes.ts | bid.controller.ts → kickBidder        | bid.validation.ts → kickBidderSchema                  |
| POST /api/v1/products/:id/auto-bid | bid.routes.ts | bid.controller.ts → createAutoBid     | bid.validation.ts → autoBidSchema                     |
| GET /api/v1/products/:id/auto-bid  | bid.routes.ts | bid.controller.ts → getAutoBid        | bid.validation.ts → productIdSchema                   |
| PUT /api/v1/auto-bid/:id           | bid.routes.ts | bid.controller.ts → updateAutoBid     | bid.validation.ts → updateAutoBidSchema               |
| DELETE /api/v1/auto-bid/:id        | bid.routes.ts | bid.controller.ts → deleteAutoBid     | bid.validation.ts → autoBidIdSchema                   |

---

## ✅ 6. Questions & Answers (Q&A)

| Endpoint                                   | Route File         | Controller                                   | Validation                                    |
| ------------------------------------------ | ------------------ | -------------------------------------------- | --------------------------------------------- |
| GET /api/v1/products/:id/questions         | question.routes.ts | question.controller.ts → getPublicQuestions  | question.validation.ts → productIdSchema      |
| GET /api/v1/products/:id/questions/private | question.routes.ts | question.controller.ts → getPrivateQuestions | question.validation.ts → productIdSchema      |
| POST /api/v1/products/:id/questions        | question.routes.ts | question.controller.ts → askQuestion         | question.validation.ts → askQuestionSchema    |
| POST /api/v1/questions/:questionId/answer  | question.routes.ts | question.controller.ts → answerQuestion      | question.validation.ts → answerQuestionSchema |

---

## ✅ 7. Chat (Winner ↔ Seller)

| Endpoint                           | Route File     | Controller                          | Validation                             |
| ---------------------------------- | -------------- | ----------------------------------- | -------------------------------------- |
| GET /api/v1/orders/:id/chat        | chat.routes.ts | chat.controller.ts → getChatHistory | chat.validation.ts → orderIdSchema     |
| POST /api/v1/orders/:id/chat       | chat.routes.ts | chat.controller.ts → sendMessage    | chat.validation.ts → sendMessageSchema |
| PUT /api/v1/chat/messages/:id/read | chat.routes.ts | chat.controller.ts → markAsRead     | chat.validation.ts → messageIdSchema   |
| GET /api/v1/chat/unread-count      | chat.routes.ts | chat.controller.ts → getUnreadCount | -                                      |

---

## ✅ 8. Orders & Post-Auction Workflow

| Endpoint                          | Route File       | Controller                              | Validation                                |
| --------------------------------- | ---------------- | --------------------------------------- | ----------------------------------------- |
| GET /api/v1/orders                | order.routes.ts  | order.controller.ts → getMyOrders       | order.validation.ts → getOrdersSchema     |
| GET /api/v1/orders/:id            | order.routes.ts  | order.controller.ts → getOrderDetails   | order.validation.ts → orderIdSchema       |
| POST /api/v1/orders/:id/mark-paid | order.routes.ts  | order.controller.ts → markAsPaid        | order.validation.ts → orderIdSchema       |
| POST /api/v1/orders/:id/payment   | order.routes.ts  | order.controller.ts → updatePaymentInfo | order.validation.ts → updatePaymentSchema |
| POST /api/v1/orders/:id/ship      | order.routes.ts  | order.controller.ts → shipOrder         | order.validation.ts → shipOrderSchema     |
| POST /api/v1/orders/:id/receive   | order.routes.ts  | order.controller.ts → receiveOrder      | order.validation.ts → orderIdSchema       |
| POST /api/v1/orders/:id/cancel    | order.routes.ts  | order.controller.ts → cancelOrder       | order.validation.ts → cancelOrderSchema   |
| GET /api/v1/users/selling-orders  | seller.routes.ts | seller.controller.ts → getSellingOrders | seller.validation.ts → getOrdersSchema    |
| POST /api/v1/orders/:id/feedback  | order.routes.ts  | order.controller.ts → leaveFeedback     | order.validation.ts → feedbackSchema      |

---

## ✅ 9. Rating System

| Endpoint                            | Route File       | Controller                              | Validation                                            |
| ----------------------------------- | ---------------- | --------------------------------------- | ----------------------------------------------------- |
| POST /api/v1/ratings                | rating.routes.ts | rating.controller.ts → createRating     | rating.validation.ts → createRatingSchema             |
| GET /api/v1/ratings/:userId         | rating.routes.ts | rating.controller.ts → getRatingHistory | rating.validation.ts → userIdSchema, paginationSchema |
| GET /api/v1/ratings/:userId/summary | rating.routes.ts | rating.controller.ts → getRatingSummary | rating.validation.ts → userIdSchema                   |

---

## ✅ 10. Admin Management

| Endpoint                                    | Route File      | Controller                               | Validation                                 |
| ------------------------------------------- | --------------- | ---------------------------------------- | ------------------------------------------ |
| GET /api/v1/admin/stats                     | admin.routes.ts | admin.controller.ts → getDashboardStats  | -                                          |
| GET /api/v1/admin/users                     | admin.routes.ts | admin.controller.ts → getUsers           | admin.validation.ts → getUsersSchema       |
| PATCH /api/v1/admin/users/:id/ban           | admin.routes.ts | admin.controller.ts → toggleBanUser      | admin.validation.ts → banUserSchema        |
| POST /api/v1/admin/users/:id/reset-password | admin.routes.ts | admin.controller.ts → resetUserPassword  | admin.validation.ts → userIdSchema         |
| GET /api/v1/admin/upgrades                  | admin.routes.ts | admin.controller.ts → getUpgradeRequests | admin.validation.ts → getUpgradesSchema    |
| POST /api/v1/admin/upgrades/:id/approve     | admin.routes.ts | admin.controller.ts → approveUpgrade     | admin.validation.ts → processUpgradeSchema |
| POST /api/v1/admin/upgrades/:id/reject      | admin.routes.ts | admin.controller.ts → rejectUpgrade      | admin.validation.ts → processUpgradeSchema |
| GET /api/v1/admin/products                  | admin.routes.ts | admin.controller.ts → getAllProducts     | admin.validation.ts → getProductsSchema    |
| GET /api/v1/admin/products/pending          | admin.routes.ts | admin.controller.ts → getPendingProducts | admin.validation.ts → paginationSchema     |
| PUT /api/v1/admin/products/:id/approve      | admin.routes.ts | admin.controller.ts → approveProduct     | admin.validation.ts → productIdSchema      |
| PUT /api/v1/admin/products/:id/reject       | admin.routes.ts | admin.controller.ts → rejectProduct      | admin.validation.ts → rejectProductSchema  |
| POST /api/v1/admin/products/:id/suspend     | admin.routes.ts | admin.controller.ts → suspendProduct     | admin.validation.ts → suspendProductSchema |
| POST /api/v1/admin/categories               | admin.routes.ts | admin.controller.ts → createCategory     | admin.validation.ts → createCategorySchema |
| PUT /api/v1/admin/categories/:id            | admin.routes.ts | admin.controller.ts → updateCategory     | admin.validation.ts → updateCategorySchema |
| DELETE /api/v1/admin/categories/:id         | admin.routes.ts | admin.controller.ts → deleteCategory     | admin.validation.ts → categoryIdSchema     |

---

## 📋 Summary

**Tổng số:**

- Routes: 12 files
- Controllers: 12 files
- Validations: 12 files
- Endpoints: 70+

**Models:**

- users.model.ts
- products.model.ts
- auction.model.ts
- interactions.model.ts
- order.model.ts
- enums.model.ts

**Middlewares:**

- auth.ts (authenticate, authorize, checkActiveAccount)
- validate.ts (validate)
- error-handler.ts (notFound, errorHandler)

---

## 🔍 Cách Sử Dụng Document Này

Khi cần implement một endpoint:

1. Tìm endpoint trong bảng mapping
2. Mở file route tương ứng
3. Mở file controller tương ứng
4. Implement logic trong controller function
5. Test endpoint

Khi gặp lỗi validation:

1. Tìm endpoint trong bảng
2. Mở file validation tương ứng
3. Kiểm tra schema
4. Điều chỉnh request data hoặc schema

---

**Status:** ✅ Complete mapping for all 70+ endpoints
