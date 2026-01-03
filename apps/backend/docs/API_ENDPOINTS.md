# 📌 **BẢNG TỔNG HỢP FULL API ENDPOINTS — ONLINE AUCTION SYSTEM**

## **Legend**

- **G** = Guest
- **U** = Authenticated User
- **BID** = Bidder
- **SEL** = Seller
- **ADM** = Admin
- **SYS** = System/Background

---

# ✅ **1. Authentication & Authorization**

| Method | Endpoint                       | Role | Mô tả                              |
| ------ | ------------------------------ | ---- | ---------------------------------- |
| POST   | /api/v1/auth/register          | G    | Đăng ký tài khoản                  |
| POST   | /api/v1/auth/login             | G    | Đăng nhập                          |
| POST   | /api/v1/auth/logout            | U    | Đăng xuất                          |
| POST   | /api/v1/auth/refresh-token     | U    | Làm mới token                      |
| POST   | /api/v1/auth/forgot-password   | G    | Quên mật khẩu                      |
| POST   | /api/v1/auth/verify-email      | G    | Xác minh email (registration)      |
| POST   | /api/v1/auth/verify-reset-otp  | G    | Xác thực OTP reset password        |
| POST   | /api/v1/auth/reset-password    | G    | Đặt mật khẩu mới                   |
| POST   | /api/v1/auth/resend-otp        | G    | Gửi lại OTP xác minh               |
| POST   | /api/v1/auth/signin-with-oauth | G    | Đăng nhập OAuth (Google, Facebook) |
| GET    | /api/v1/auth/oauth/callback    | G    | OAuth callback URL                 |

---

# ✅ **2. User & Account**

| Method | Endpoint                           | Role | Mô tả                       |
| ------ | ---------------------------------- | ---- | --------------------------- |
| GET    | /api/v1/users/profile              | U    | Lấy profile của mình        |
| PUT    | /api/v1/users/profile              | U    | Cập nhật profile            |
| PATCH  | /api/v1/users/password             | U    | Đổi mật khẩu                |
| GET    | /api/v1/users/:id/public-profile   | U    | Xem profile người khác      |
| GET    | /api/v1/users/:id/rating-summary   | U    | Tổng hợp điểm đánh giá      |
| POST   | /api/v1/users/watchlist/:productId | BID  | Thêm/Xóa watchlist          |
| GET    | /api/v1/users/watchlist            | BID  | Danh sách watchlist         |
| GET    | /api/v1/users/bids                 | BID  | Lịch sử bidding             |
| POST   | /api/v1/users/upgrade-request      | BID  | Gửi yêu cầu nâng cấp Seller |

---

# ✅ **3. Categories**

| Method | Endpoint                        | Role | Mô tả                       |
| ------ | ------------------------------- | ---- | --------------------------- |
| GET    | /api/v1/categories              | G    | Lấy cây danh mục            |
| GET    | /api/v1/categories/:id/products | G    | Lấy sản phẩm trong danh mục |
| POST   | /api/v1/admin/categories        | ADM  | Tạo danh mục                |
| PUT    | /api/v1/admin/categories/:id    | ADM  | Sửa danh mục                |
| DELETE | /api/v1/admin/categories/:id    | ADM  | Xóa danh mục                |

---

# ✅ **4. Products (Public & Seller)**

| Method | Endpoint                                 | Role | Mô tả                         |
| ------ | ---------------------------------------- | ---- | ----------------------------- |
| GET    | /api/v1/products                         | G    | Tìm kiếm & lọc                |
| GET    | /api/v1/products/top-listing             | G    | Top sản phẩm (ending, hot...) |
| GET    | /api/v1/products/:id                     | G    | Xem chi tiết sản phẩm         |
| GET    | /api/v1/products/:id/related             | G    | Sản phẩm liên quan            |
| GET    | /api/v1/products/:id/images              | G    | Lấy danh sách ảnh             |
| GET    | /api/v1/products/:id/description-updates | G    | Lịch sử chỉnh sửa mô tả       |
| POST   | /api/v1/products                         | SEL  | Đăng bán sản phẩm             |
| GET    | /api/v1/seller/products                  | SEL  | Quản lý sản phẩm của tôi      |
| DELETE | /api/v1/products/:id                     | SEL  | Hủy sản phẩm (chưa active)    |
| PATCH  | /api/v1/products/:id/description         | SEL  | Chỉnh sửa mô tả (append)      |
| PUT    | /api/v1/products/:id/auto-extend         | SEL  | Bật/tắt gia hạn               |
| POST   | /api/v1/products/upload                  | SEL  | Upload ảnh sản phẩm           |

---

# ✅ **5. Bidding & Auction**

| Method | Endpoint                      | Role    | Mô tả                 |
| ------ | ----------------------------- | ------- | --------------------- |
| GET    | /api/v1/products/:id/bids     | G       | Lịch sử bidding       |
| POST   | /api/v1/products/:id/bids     | BID/SEL | Ra giá                |
| POST   | /api/v1/products/:id/kick     | SEL     | Kick bidder           |
| POST   | /api/v1/products/:id/auto-bid | BID/SEL | Tạo auto-bid          |
| PUT    | /api/v1/products/auto-bid/:id | BID/SEL | Cập nhật auto-bid     |
| DELETE | /api/v1/products/auto-bid/:id | BID/SEL | Xóa auto-bid          |
| GET    | /api/v1/products/:id/auto-bid | BID/SEL | Xem auto-bid của mình |

---

# ✅ **6. Questions & Answers (Q&A)**

| Method | Endpoint                                      | Role | Mô tả           |
| ------ | --------------------------------------------- | ---- | --------------- |
| GET    | /api/v1/products/:id/questions                | G    | Q&A công khai   |
| POST   | /api/v1/products/:id/questions                | BID  | Gửi câu hỏi     |
| POST   | /api/v1/products/questions/:questionId/answer | SEL  | Trả lời câu hỏi |

---

# ✅ **7. Chat (Winner ↔ Seller)**

| Method | Endpoint                             | Role    | Mô tả               |
| ------ | ------------------------------------ | ------- | ------------------- |
| GET    | /api/v1/orders/:id/chat              | WIN/SEL | Lấy lịch sử chat    |
| POST   | /api/v1/orders/:id/chat              | WIN/SEL | Gửi tin nhắn        |
| PUT    | /api/v1/orders/messages/:id/read     | U       | Đánh dấu đã đọc     |
| GET    | /api/v1/orders/messages/unread-count | U       | Báo số tin chưa đọc |

---

# ✅ **8. Orders & Post-Auction Workflow**

| Method | Endpoint                           | Role    | Mô tả                            |
| ------ | ---------------------------------- | ------- | -------------------------------- |
| POST   | /api/v1/orders                     | WIN     | Tạo đơn hàng (Instant Buy Now)   |
| GET    | /api/v1/orders                     | U       | Danh sách đơn hàng của mình      |
| GET    | /api/v1/orders/:id                 | U       | Chi tiết đơn hàng                |
| POST   | /api/v1/orders/:id/shipping        | WIN     | Buyer cập nhật địa chỉ giao hàng |
| POST   | /api/v1/orders/:id/mark-paid       | WIN     | Buyer xác nhận đã thanh toán     |
| POST   | /api/v1/orders/:id/confirm-payment | SEL     | Seller xác nhận nhận tiền        |
| POST   | /api/v1/orders/:id/ship            | SEL     | Seller gửi hàng                  |
| POST   | /api/v1/orders/:id/receive         | WIN     | Buyer xác nhận nhận hàng         |
| POST   | /api/v1/orders/:id/cancel          | SEL     | Hủy đơn hàng                     |
| GET    | /api/v1/users/selling-orders       | SEL     | Đơn hàng của seller              |
| POST   | /api/v1/orders/:id/feedback        | WIN/SEL | Đánh giá sau giao dịch           |

---

# ✅ **9. Rating System**

| Method | Endpoint                        | Role    | Mô tả            |
| ------ | ------------------------------- | ------- | ---------------- |
| POST   | /api/v1/ratings                 | WIN/SEL | Gửi đánh giá     |
| GET    | /api/v1/ratings/:userId         | G       | Lịch sử đánh giá |
| GET    | /api/v1/ratings/:userId/summary | G       | Tổng hợp rating  |

---

# ✅ **10. Admin Management**

| Method | Endpoint                               | Role | Mô tả                     |
| ------ | -------------------------------------- | ---- | ------------------------- |
| GET    | /api/v1/admin/stats                    | ADM  | Dashboard thống kê cơ bản |
| GET    | /api/v1/admin/analytics                | ADM  | Toàn bộ analytics data    |
| GET    | /api/v1/admin/analytics/categories     | ADM  | Category insights         |
| GET    | /api/v1/admin/analytics/auction-health | ADM  | Auction health metrics    |
| GET    | /api/v1/admin/analytics/operations     | ADM  | Operations metrics        |
| GET    | /api/v1/admin/analytics/engagement     | ADM  | Engagement metrics        |
| GET    | /api/v1/admin/users                    | ADM  | Danh sách user            |
| PATCH  | /api/v1/admin/users/:id/ban            | ADM  | Ban user                  |
| POST   | /api/v1/admin/users/:id/reset-password | ADM  | Reset mật khẩu            |
| GET    | /api/v1/admin/upgrades                 | ADM  | Yêu cầu nâng cấp seller   |
| POST   | /api/v1/admin/upgrades/:id/approve     | ADM  | Duyệt nâng cấp            |
| POST   | /api/v1/admin/upgrades/:id/reject      | ADM  | Từ chối                   |
| GET    | /api/v1/admin/products                 | ADM  | Tất cả sản phẩm           |
| GET    | /api/v1/admin/products/pending         | ADM  | SP chờ duyệt              |
| PUT    | /api/v1/admin/products/:id/approve     | ADM  | Duyệt SP                  |
| PUT    | /api/v1/admin/products/:id/reject      | ADM  | Từ chối SP                |
| POST   | /api/v1/admin/products/:id/suspend     | ADM  | Gỡ SP đang active         |
