# API Services

Type-safe API client wrappers for all backend endpoints using shared-types.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
  - [Service Pattern](#service-pattern)
- [Usage](#usage)
  - [Importing Services](#importing-services)
  - [1. Authentication Service (AuthService)](#1-authentication-service-authservice)
  - [2. User Service (UserService)](#2-user-service-userservice)
  - [3. Product Service (ProductService)](#3-product-service-productservice)
  - [4. Bid Service (BidService)](#4-bid-service-bidservice)
  - [5. Order Service (OrderService)](#5-order-service-orderservice)
  - [6. Question Service (QuestionService)](#6-question-service-questionservice)
  - [7. Chat Service (ChatService)](#7-chat-service-chatservice)
  - [8. Rating Service (RatingService)](#8-rating-service-ratingservice)
  - [9. Category Service (CategoryService)](#9-category-service-categoryservice)
  - [10. Seller Service (SellerService)](#10-seller-service-sellerservice)
  - [11. Admin Service (AdminService)](#11-admin-service-adminservice)
- [Features](#features)
  - [Type Safety](#type-safety)
  - [Error Handling](#error-handling)
  - [Authentication](#authentication)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

This folder contains service modules that wrap API calls with TypeScript types from `@repo/shared-types`, ensuring type safety across the entire application stack.

## Structure

```text
services/
├── index.ts              # Centralized exports for all services
├── auth.service.ts       # Authentication & authorization
├── user.service.ts       # User profile & preferences management
├── product.service.ts    # Product listings & auction management
├── bid.service.ts        # Bidding operations & auto-bid
├── order.service.ts      # Order tracking & fulfillment
├── question.service.ts   # Product Q&A system
├── chat.service.ts       # Order-based messaging
├── rating.service.ts     # User rating & feedback
├── category.service.ts   # Product categorization
├── seller.service.ts     # Seller dashboard operations
└── admin.service.ts      # Admin panel operations
```

### Service Pattern

All services follow a consistent pattern:

```typescript
// Each service exports an object with methods
export const ServiceName = {
  methodName1,
  methodName2,
  // ...
};

// Example method structure
async function methodName(
  params: TypeFromSharedTypes
): Promise<ApiResponse<ReturnType>> {
  const response = await apiClient.method<ApiResponse<ReturnType>>(
    API_ENDPOINTS.resource.endpoint,
    data
  );
  return response.data;
}
```

## Usage

### Importing Services

```typescript
// Import individual services
import { AuthService, ProductService, BidService } from "@/services";

// Use service methods
const products = await ProductService.searchProducts(params);
const user = await AuthService.login(credentials);
```

### 1. Authentication Service (`AuthService`)

Handles user authentication, registration, and password management.

**Methods:**

- `register(data)` - Register new user
- `login(data)` - User login
- `logout()` - User logout
- `refreshToken()` - Refresh access token
- `forgotPassword(data)` - Request password reset
- `verifyOtp(data)` - Verify OTP code
- `resetPassword(data)` - Reset password with token
- `googleLogin(token)` - Google OAuth login
- `verifyEmail(data)` - Verify email address
- `resendVerification(data)` - Resend verification email

**Example:**

```typescript
import { AuthService } from "@/services";
import type { RegisterRequest, LoginRequest } from "@repo/shared-types";

// Register
const registerData: RegisterRequest = {
  email: "user@example.com",
  password: "Password123",
  fullName: "John Doe",
};
const registerResult = await AuthService.register(registerData);

// Login
const loginData: LoginRequest = {
  email: "user@example.com",
  password: "Password123",
};
const loginResult = await AuthService.login(loginData);
console.log(loginResult.data.accessToken);

// Forgot Password Flow
await AuthService.forgotPassword({ email: "user@example.com" });
await AuthService.verifyOtp({ email: "user@example.com", otp: "123456" });
await AuthService.resetPassword({
  token: "reset-token",
  newPassword: "NewPassword123",
});
```

### 2. User Service (`UserService`)

Manages user profile, preferences, and watchlist.

**Methods:**

- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update profile information
- `changePassword(data)` - Change user password
- `getPublicProfile(userId)` - Get public profile of any user
- `getRatingSummary(userId)` - Get user's rating summary
- `addToWatchlist(productId)` - Add product to watchlist
- `removeFromWatchlist(productId)` - Remove from watchlist
- `getWatchlist()` - Get user's watchlist
- `getBiddingHistory()` - Get bidding history
- `requestUpgrade()` - Request seller upgrade

**Example:**

```typescript
import { UserService } from "@/services";
import type { UpdateProfileRequest } from "@repo/shared-types";

// Get current user profile
const profile = await UserService.getProfile();

// Update profile
const updateData: UpdateProfileRequest = {
  fullName: "John Smith",
  address: "123 Main St",
};
await UserService.updateProfile(updateData);

// Manage watchlist
await UserService.addToWatchlist("product-id-123");
const watchlist = await UserService.getWatchlist();
await UserService.removeFromWatchlist("product-id-123");

// Request seller upgrade
await UserService.requestUpgrade({
  businessName: "My Store",
  businessAddress: "456 Business Ave",
});
```

### 3. Product Service (`ProductService`)

Handles product search, creation, and management.

**Methods:**

- `searchProducts(params)` - Search products with filters
- `getTopListings(params)` - Get top/featured listings
- `getProductById(productId)` - Get product details
- `getProductImages(productId)` - Get product images
- `getRelatedProducts(productId)` - Get related products
- `getDescriptionUpdates(productId)` - Get description history
- `createProduct(data)` - Create new product listing
- `updateDescription(productId, data)` - Update product description
- `toggleAutoExtend(productId, data)` - Toggle auto-extend feature
- `uploadImages(productId, formData)` - Upload product images

**Example:**

```typescript
import { ProductService } from "@/services";
import type {
  SearchProductsParams,
  CreateProductRequest,
} from "@repo/shared-types";

// Search products
const searchParams: SearchProductsParams = {
  page: 1,
  limit: 20,
  keyword: "laptop",
  categoryId: "electronics",
  minPrice: 100,
  maxPrice: 1000,
  sortBy: "endTime",
  sortOrder: "asc",
};
const searchResult = await ProductService.searchProducts(searchParams);
console.log(searchResult.items); // Product[]
console.log(searchResult.pagination); // PaginationMeta

// Get product details
const product = await ProductService.getProductById("product-123");
const images = await ProductService.getProductImages("product-123");
const related = await ProductService.getRelatedProducts("product-123");

// Create product (seller only)
const productData: CreateProductRequest = {
  name: "MacBook Pro 2023",
  description: "Brand new laptop",
  categoryId: "electronics",
  startingPrice: 1000,
  stepPrice: 50,
  buyNowPrice: 2000,
  endTime: new Date("2024-12-31"),
  autoExtend: true,
};
const newProduct = await ProductService.createProduct(productData);
```

### 4. Bid Service (`BidService`)

Manages bidding operations including auto-bid functionality.

**Methods:**

- `getBiddingHistory(productId)` - Get all bids for a product
- `placeBid(productId, data)` - Place a manual bid
- `kickBidder(productId, data)` - Kick a bidder (seller only)
- `createAutoBid(productId, data)` - Create auto-bid configuration
- `getAutoBid(productId)` - Get current auto-bid settings
- `updateAutoBid(productId, data)` - Update auto-bid settings
- `deleteAutoBid(productId)` - Remove auto-bid

**Example:**

```typescript
import { BidService } from "@/services";
import type { PlaceBidRequest, CreateAutoBidRequest } from "@repo/shared-types";

// Get bidding history
const bids = await BidService.getBiddingHistory("product-123");

// Place a bid
const bidData: PlaceBidRequest = {
  bidAmount: 250.0,
};
const bidResult = await BidService.placeBid("product-123", bidData);

// Setup auto-bid
const autoBidData: CreateAutoBidRequest = {
  maxAmount: 500.0,
};
await BidService.createAutoBid("product-123", autoBidData);

// Update auto-bid
await BidService.updateAutoBid("product-123", {
  maxAmount: 750.0,
});

// Remove auto-bid
await BidService.deleteAutoBid("product-123");
```

### 5. Order Service (`OrderService`)

Handles order management and fulfillment.

**Methods:**

- `getMyOrders(params)` - Get user's orders with filters
- `getOrderDetails(orderId)` - Get specific order details
- `updatePaymentInfo(orderId, data)` - Update payment information
- `shipOrder(orderId, data)` - Mark order as shipped (seller)
- `cancelOrder(orderId, data)` - Cancel an order
- `leaveFeedback(orderId, data)` - Leave order feedback

**Example:**

```typescript
import { OrderService } from "@/services";
import type { GetOrdersParams, UpdatePaymentRequest } from "@repo/shared-types";

// Get orders
const ordersParams: GetOrdersParams = {
  page: 1,
  limit: 10,
  status: "pending",
};
const orders = await OrderService.getMyOrders(ordersParams);

// Get order details
const order = await OrderService.getOrderDetails("order-123");

// Update payment
const paymentData: UpdatePaymentRequest = {
  paymentMethod: "credit_card",
  paymentStatus: "paid",
};
await OrderService.updatePaymentInfo("order-123", paymentData);

// Ship order (seller)
await OrderService.shipOrder("order-123", {
  trackingNumber: "TRACK123",
  carrier: "UPS",
});

// Leave feedback
await OrderService.leaveFeedback("order-123", {
  rating: 5,
  comment: "Great transaction!",
});
```

### 6. Question Service (`QuestionService`)

Manages product Q&A functionality.

**Methods:**

- `getPublicQuestions(productId)` - Get public questions
- `getPrivateQuestions(productId)` - Get private questions (seller)
- `askQuestion(productId, data)` - Ask a question
- `answerQuestion(questionId, data)` - Answer a question (seller)

**Example:**

```typescript
import { QuestionService } from "@/services";
import type { AskQuestionRequest } from "@repo/shared-types";

// Get questions
const publicQuestions = await QuestionService.getPublicQuestions("product-123");

// Ask a question
const questionData: AskQuestionRequest = {
  content: "What is the warranty period?",
  isPrivate: false,
};
await QuestionService.askQuestion("product-123", questionData);

// Answer question (seller)
await QuestionService.answerQuestion("question-123", {
  answer: "The warranty is 2 years.",
});
```

### 7. Chat Service (`ChatService`)

Handles order-based messaging between buyers and sellers.

**Methods:**

- `getChatHistory(orderId)` - Get chat messages for an order
- `sendMessage(orderId, data)` - Send a message
- `markAsRead(orderId)` - Mark messages as read
- `getUnreadCount()` - Get unread message count

**Example:**

```typescript
import { ChatService } from "@/services";
import type { SendMessageRequest } from "@repo/shared-types";

// Get chat history
const messages = await ChatService.getChatHistory("order-123");

// Send message
const messageData: SendMessageRequest = {
  content: "When will this ship?",
};
await ChatService.sendMessage("order-123", messageData);

// Mark as read
await ChatService.markAsRead("order-123");

// Get unread count
const unreadCount = await ChatService.getUnreadCount();
console.log(unreadCount.data.count);
```

### 8. Rating Service (`RatingService`)

Manages user ratings and feedback.

**Methods:**

- `createRating(data)` - Create a rating
- `getRatingHistory(userId)` - Get user's rating history
- `getRatingSummary(userId)` - Get rating summary statistics

**Example:**

```typescript
import { RatingService } from "@/services";
import type { CreateRatingRequest } from "@repo/shared-types";

// Create rating
const ratingData: CreateRatingRequest = {
  ratedUserId: "user-456",
  orderId: "order-123",
  rating: 5,
  comment: "Excellent seller!",
};
await RatingService.createRating(ratingData);

// Get rating history
const ratings = await RatingService.getRatingHistory("user-456");

// Get rating summary
const summary = await RatingService.getRatingSummary("user-456");
console.log(summary.data.averageRating);
```

### 9. Category Service (`CategoryService`)

Handles product categories.

**Methods:**

- `getCategories()` - Get all categories
- `getProductsByCategory(categoryId, params)` - Get products in category

**Example:**

```typescript
import { CategoryService } from "@/services";
import type { GetCategoryProductsParams } from "@repo/shared-types";

// Get all categories
const categories = await CategoryService.getCategories();

// Get products by category
const params: GetCategoryProductsParams = {
  page: 1,
  limit: 20,
  sortBy: "endTime",
};
const products = await CategoryService.getProductsByCategory(
  "electronics",
  params
);
```

### 10. Seller Service (`SellerService`)

Seller dashboard operations.

**Methods:**

- `getMyProducts(params)` - Get seller's product listings
- `getSellingOrders(params)` - Get orders for seller's products

**Example:**

```typescript
import { SellerService } from "@/services";
import type {
  GetSellerProductsParams,
  GetSellerOrdersParams,
} from "@repo/shared-types";

// Get my products
const productsParams: GetSellerProductsParams = {
  page: 1,
  limit: 20,
  status: "active",
};
const myProducts = await SellerService.getMyProducts(productsParams);

// Get selling orders
const ordersParams: GetSellerOrdersParams = {
  page: 1,
  limit: 10,
};
const sellingOrders = await SellerService.getSellingOrders(ordersParams);
```

### 11. Admin Service (`AdminService`)

Admin panel operations (admin only).

**Methods:**

- `getDashboardStats()` - Get dashboard statistics
- `getUsers(params)` - Get users with filters
- `toggleBanUser(userId, data)` - Ban/unban user
- `resetUserPassword(userId, data)` - Reset user password
- `getUpgradeRequests(params)` - Get seller upgrade requests
- `approveUpgrade(requestId, data)` - Approve upgrade request
- `rejectUpgrade(requestId, data)` - Reject upgrade request
- `getAllProducts(params)` - Get all products
- `approveProduct(productId, data)` - Approve product listing
- `rejectProduct(productId, data)` - Reject product listing
- `suspendProduct(productId, data)` - Suspend product
- `getCategories()` - Get all categories
- `createCategory(data)` - Create new category
- `updateCategory(categoryId, data)` - Update category
- `deleteCategory(categoryId)` - Delete category

**Example:**

```typescript
import { AdminService } from "@/services";
import type { GetUsersParams, CreateCategoryRequest } from "@repo/shared-types";

// Get dashboard stats
const stats = await AdminService.getDashboardStats();

// Manage users
const usersParams: GetUsersParams = {
  page: 1,
  limit: 50,
  role: "buyer",
};
const users = await AdminService.getUsers(usersParams);

// Ban user
await AdminService.toggleBanUser("user-123", {
  isBanned: true,
  reason: "Violation of terms",
});

// Manage upgrade requests
const upgradeRequests = await AdminService.getUpgradeRequests({
  page: 1,
  limit: 20,
});
await AdminService.approveUpgrade("request-123", {
  note: "Approved",
});

// Manage categories
const categoryData: CreateCategoryRequest = {
  name: "Electronics",
  description: "Electronic devices",
};
await AdminService.createCategory(categoryData);
```

## Features

### Type Safety

All services use types from `@repo/shared-types`:

- **Request Types**: Matches backend validation schemas exactly
- **Response Types**: Consistent with backend controllers
- **Type Inference**: Full IntelliSense support in IDE

### Error Handling

Services throw errors that can be caught and handled:

```typescript
try {
  await ProductService.createProduct(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data;
    console.error(apiError.error.message);
  }
}
```

### Authentication

The `apiClient` automatically handles:

- **Token Injection**: Adds `Authorization` header from localStorage
- **Token Refresh**: Auto-refreshes expired tokens
- **Redirect**: Redirects to login on auth failure

## Best Practices

### 1. Always Use Types

```typescript
// ✅ Good - Type-safe
const data: RegisterRequest = { ... };
await AuthService.register(data);

// ❌ Bad - No type checking
await AuthService.register({ email: "...", password: "..." });
```

### 2. Handle Errors Properly

```typescript
try {
  const result = await ProductService.createProduct(data);
  // Handle success
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle API error
    const apiError = error.response?.data?.error;
    showToast(apiError.message);
  }
}
```

### 3. Use in React Router Actions

```typescript
// In route action
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await AuthService.login({ email, password });
    // Store token and redirect
    localStorage.setItem("accessToken", response.data.accessToken);
    return redirect("/dashboard");
  } catch (error) {
    return { error: "Login failed" };
  }
}
```

### 4. Paginate Large Lists

```typescript
// Always use pagination for large datasets
const params: GetOrdersParams = {
  page: 1,
  limit: 20, // Reasonable page size
  status: "pending",
};
const orders = await OrderService.getMyOrders(params);
```

### 5. Clean Up Resources

```typescript
// In React components, clean up on unmount
useEffect(() => {
  const fetchData = async () => {
    const products = await ProductService.searchProducts(params);
    setProducts(products.items);
  };

  fetchData();

  return () => {
    // Clean up if needed
  };
}, []);
```

## Related Documentation

- [Shared Types Package](../../../packages/shared-types/README.md)
- [Backend API Documentation](../../backend/docs/API_ENDPOINTS.md)
- [API Handler](../lib/handlers/api.ts)
- [API Endpoints Constants](../constants/api-endpoints.ts)
