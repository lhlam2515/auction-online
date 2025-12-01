# @repo/shared-types

Shared TypeScript types for the auction-online project. This package provides consistent type definitions used across both frontend and backend applications.

## 📁 Package Structure

```
src/
├── common/          # Base types (ApiResponse, Pagination, etc.)
├── auth/            # Authentication types
├── user/            # User types
├── category/        # Category types
├── product/         # Product & auction types
├── bid/             # Bidding types
├── question/        # Product Q&A types
├── chat/            # Chat & messaging types
├── order/           # Order types
├── rating/          # Rating & review types
├── seller/          # Seller-specific types
├── admin/           # Admin types
└── index.ts         # Main export file
```

## 🚀 Installation

This package is part of the monorepo workspace and will be automatically linked when you run:

```bash
pnpm install
```

## 📖 Usage

### Import Everything

```typescript
import type { User, Product, ApiResponse } from "@repo/shared-types";
```

### Import from Specific Modules

```typescript
// More explicit and better for tree-shaking
import type { User, UserRole } from "@repo/shared-types/user";
import type { Product, ProductStatus } from "@repo/shared-types/product";
import type { ApiResponse, PaginationParams } from "@repo/shared-types/common";
```

### Examples

#### In Frontend (React)

```typescript
import type {
  User,
  Product,
  ApiResponse,
  LoginRequest,
} from "@repo/shared-types";

const handleLogin = async (data: LoginRequest) => {
  const response: ApiResponse<LoginResponse> = await api.post(
    "/auth/login",
    data
  );
  return response.data;
};
```

#### In Backend (Node.js/Express)

```typescript
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from "@repo/shared-types";

app.post("/auth/login", async (req, res) => {
  const loginData: LoginRequest = req.body;

  const response: ApiResponse<LoginResponse> = {
    success: true,
    message: "Login successful",
    data: {
      user: {
        /* ... */
      },
      accessToken: "token",
    },
  };

  res.json(response);
});
```

## 📚 Type Categories

### Common (`/common`)

Base types used across all domains:

- `ApiResponse<T>` - Standard API response wrapper
- `PaginationParams` - Pagination query parameters
- `PaginatedResponse<T>` - Paginated list response
- `ApiError` - Error response structure
- `ActionResponse<T>` - Form action response

### Auth (`/auth`)

Authentication and authorization:

- `RegisterRequest`, `LoginRequest`
- `LoginResponse`, `GoogleLoginResponse`
- `ForgotPasswordRequest`, `ResetPasswordRequest`, `VerifyOtpRequest`
- `VerifyEmailRequest`, `ResendVerificationRequest`

### User (`/user`)

User profile and management:

- `User`, `UserRole`
- `UpdateProfileRequest`
- `ChangePasswordRequest`
- `UpgradeRequestData`

### Category (`/category`)

Product categorization:

- `Category`
- `CreateCategoryRequest`, `UpdateCategoryRequest`

### Product (`/product`)

Auction products:

- `Product`, `ProductStatus`, `ProductSortOption`, `TopListingType`
- `CreateProductRequest`, `UpdateDescriptionRequest`, `AutoExtendRequest`
- `SearchProductsParams`, `TopListingParams`
- `TopListingResponse`, `DescriptionUpdate`
- `UploadImagesResponse`

### Bid (`/bid`)

Bidding operations:

- `Bid`, `AutoBid`
- `PlaceBidRequest`
- `CreateAutoBidRequest`, `UpdateAutoBidRequest`
- `KickBidderRequest`

### Question (`/question`)

Product Q&A:

- `Question`
- `AskQuestionRequest`, `AnswerQuestionRequest`

### Chat (`/chat`)

Order messaging:

- `ChatMessage`
- `SendMessageRequest`
- `UnreadCountResponse`

### Order (`/order`)

Order management:

- `Order`, `OrderStatus`
- `UpdatePaymentRequest`
- `ShipOrderRequest`, `CancelOrderRequest`
- `OrderFeedbackRequest`

### Rating (`/rating`)

User ratings and reviews (like/dislike system):

- `Rating`, `RatingSummary`, `RatingScore`
- `CreateRatingRequest`

### Seller (`/seller`)

Seller-specific operations:

- `GetSellerProductsParams`
- `GetSellerOrdersParams`

### Admin (`/admin`)

Administrative operations:

- `AdminStats`, `AdminUser`, `UpgradeRequest`
- `GetUsersParams`, `GetUpgradeRequestsParams`, `GetProductsParams`
- `BanUserRequest`, `ResetUserPasswordRequest`
- `ProcessUpgradeRequest`
- `RejectProductRequest`, `SuspendProductRequest`
- `CreateCategoryRequest`, `UpdateCategoryRequest`

## 🛠️ Development

### Build the types

```bash
pnpm build
```

### Watch mode for development

```bash
pnpm dev
```

### Type checking

```bash
pnpm typecheck
```

### Clean build artifacts

```bash
pnpm clean
```

## 📝 Adding New Types

When adding new types, follow this workflow:

1. **Identify the domain** - Determine which module the type belongs to (auth, user, product, etc.)

2. **Add to appropriate file** - Edit the corresponding `*.types.ts` file:

   ```typescript
   // src/product/product.types.ts
   export interface NewProductFeature {
     id: string;
     name: string;
   }
   ```

3. **Export from module** - Ensure it's exported from the module's `index.ts`:

   ```typescript
   // src/product/index.ts
   export * from "./product.types";
   ```

4. **Build and verify**:

   ```bash
   pnpm build
   ```

5. **Use in applications** - Types are automatically available in frontend and backend

### Creating a New Module

If you need a new domain module:

1. Create folder: `src/new-module/`
2. Create types file: `src/new-module/new-module.types.ts`
3. Create index: `src/new-module/index.ts`
4. Export from main: Update `src/index.ts`

Example:

```typescript
// src/notification/notification.types.ts
export interface Notification {
  id: string;
  message: string;
  read: boolean;
}

// src/notification/index.ts
export * from "./notification.types";

// src/index.ts
export * from "./notification";
```

## 🎯 Best Practices

1. **Use clear, descriptive names** - Types should be self-documenting
2. **Add JSDoc comments** - Especially for complex types
3. **Keep modules focused** - One domain per module
4. **Use type imports** - `import type { ... }` when possible
5. **Maintain backward compatibility** - Be careful when modifying existing types

## 🔄 Migration Guide

All existing imports will continue to work with the new modular structure:

```typescript
// This still works and is recommended
import type { User, Product } from "@repo/shared-types";

// You can also import from specific modules for better tree-shaking
import type { User } from "@repo/shared-types/user";
import type { Product } from "@repo/shared-types/product";
```

## 🤝 Contributing

When contributing new types:

- Follow the existing naming conventions
- Add JSDoc comments for public APIs
- Update this README if adding new modules
- Run `pnpm build` to verify TypeScript compilation
- Ensure types are framework-agnostic

## 📄 License

Part of the auction-online monorepo project.
