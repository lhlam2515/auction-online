# API Layer Documentation

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Cách sử dụng](#cách-sử-dụng)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [User & Profile](#user--profile)
  - [Products](#products)
  - [Bidding](#bidding)
  - [Orders](#orders)
  - [Admin](#admin)
- [Type Safety](#type-safety)
- [Response Structure](#response-structure)

## Tổng quan

API Layer là lớp tích hợp thống nhất cho tất cả 70+ endpoints của hệ thống đấu giá. Sử dụng TypeScript và constants tập trung để quản lý URLs.

## Tính năng

- ✅ **Type-safe** - Full TypeScript với shared types
- ✅ **Centralized URLs** - Sử dụng `API_ENDPOINTS` constants
- ✅ **Auto token refresh** - Xử lý authentication tự động
- ✅ **Query parameters** - Tự động build URLs với params
- ✅ **Error handling** - Xử lý lỗi thống nhất

## Cách sử dụng

### Import

```typescript
import { api } from "@/lib/api-layer";
```

### Ví dụ cơ bản

```typescript
// Tìm kiếm sản phẩm
const products = await api.products.search({
  search: "laptop",
  page: 1,
  limit: 20,
});

// Đặt giá
await api.bids.placeBid("product-123", { amount: 150 });

// Lấy profile
const user = await api.users.getProfile();
```

## API Reference

### Authentication

```typescript
// Đăng ký
await api.auth.register({
  email: "user@example.com",
  password: "password123",
  fullName: "Nguyễn Văn A",
});

// Đăng nhập
const response = await api.auth.login({
  email: "user@example.com",
  password: "password123",
});

// Đăng xuất
await api.auth.logout();

// Quên mật khẩu
await api.auth.forgotPassword({ email: "user@example.com" });
await api.auth.verifyOtp({ email: "user@example.com", otp: "123456" });
await api.auth.resetPassword({
  email: "user@example.com",
  otp: "123456",
  newPassword: "newpass123",
});
```

### User & Profile

```typescript
// Lấy thông tin cá nhân
const profile = await api.users.getProfile();

// Cập nhật profile
await api.users.updateProfile({
  fullName: "Tên mới",
  address: "Địa chỉ mới",
});

// Đổi mật khẩu
await api.users.changePassword({
  currentPassword: "old123",
  newPassword: "new123",
});

// Quản lý watchlist
await api.users.toggleWatchlist("product-123");
const watchlist = await api.users.getWatchlist({ page: 1 });

// Xem lịch sử bid
const bids = await api.users.getBids({ page: 1 });
```

### Products

```typescript
// Tìm kiếm sản phẩm
const products = await api.products.search({
  search: "laptop",
  category: "electronics",
  minPrice: 100,
  maxPrice: 500,
  page: 1,
  limit: 20,
});

// Chi tiết sản phẩm
const product = await api.products.getById("product-123");

// Sản phẩm liên quan
const related = await api.products.getRelated("product-123");

// Tạo sản phẩm mới (Seller)
const newProduct = await api.products.create({
  title: "iPhone 15",
  description: "Mô tả sản phẩm...",
  categoryId: "cat-123",
  startingPrice: 100,
  buyItNowPrice: 500,
  auctionEndTime: "2025-01-01T12:00:00Z",
});

// Upload ảnh
const formData = new FormData();
formData.append("images", file);
await api.products.uploadImages(formData);
```

### Bidding

```typescript
// Xem lịch sử đấu giá
const bidHistory = await api.bids.getHistory("product-123");

// Đặt giá
await api.bids.placeBid("product-123", { amount: 150 });

// Auto bid
await api.bids.createAutoBid("product-123", { maxAmount: 200 });
await api.bids.updateAutoBid("autobid-123", { maxAmount: 250 });
await api.bids.deleteAutoBid("autobid-123");

// Kick bidder (Seller)
await api.bids.kickBidder("product-123", {
  bidderId: "user-456",
  reason: "Vi phạm quy định",
});
```

### Orders

```typescript
// Danh sách đơn hàng
const orders = await api.orders.getAll({
  page: 1,
  status: "pending",
  role: "buyer",
});

// Chi tiết đơn hàng
const order = await api.orders.getById("order-123");

// Thanh toán (Buyer)
await api.orders.markPaid("order-123", {
  paymentMethod: "credit_card",
  transactionId: "txn_123",
  amount: 150,
});

// Gửi hàng (Seller)
await api.orders.ship("order-123", {
  trackingNumber: "TRK123",
  carrier: "Viettel Post",
  estimatedDelivery: "2025-01-15",
});

// Xác nhận nhận hàng
await api.orders.confirmReceived("order-123");

// Đánh giá
await api.orders.submitFeedback("order-123", {
  rating: 5,
  comment: "Người bán tốt!",
});
```

### Admin

```typescript
// Thống kê
const stats = await api.admin.getStats();

// Quản lý users
const users = await api.admin.users.getAll({ page: 1 });
await api.admin.users.ban("user-123", { reason: "Vi phạm", duration: 30 });

// Quản lý sản phẩm
const pendingProducts = await api.admin.products.getPending();
await api.admin.products.approve("product-123");
await api.admin.products.reject("product-456", { reason: "Không phù hợp" });

// Duyệt upgrade
const upgrades = await api.admin.upgrades.getAll({ status: "pending" });
await api.admin.upgrades.approve("upgrade-123");
```

## Type Safety

API Layer có type safety hoàn toàn:

```typescript
// TypeScript sẽ kiểm tra type và gợi ý autocomplete
const searchParams: ProductSearchParams = {
  category: "electronics", // ✅ Hợp lệ
  minPrice: 100, // ✅ Hợp lệ
  invalidField: "test", // ❌ Lỗi TypeScript
};

const products = await api.products.search(searchParams);
// products đã được type như ApiResponse<PaginatedResponse<Product>>
```

## Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```
