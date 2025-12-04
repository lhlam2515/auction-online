# @repo/shared-types

Shared TypeScript types for the auction-online project. This package provides consistent type definitions used across both frontend and backend applications.

**⚠️ Important**: All types have been updated to exactly match the backend Drizzle ORM database models to ensure perfect type safety and consistency.

## 📑 Table of Contents

- [Package Structure](#-package-structure)
- [Backend Model Alignment](#-backend-model-alignment)
- [Type Safety Features](#-type-safety-features)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Basic Import](#basic-import)
  - [Import from Specific Modules](#import-from-specific-modules)
- [Key Enum Types](#-key-enum-types)
- [Important Type Considerations](#-important-type-considerations)
  - [Decimal Values as Strings](#decimal-values-as-strings)
  - [UUID Identifiers](#uuid-identifiers)
  - [Rating System](#rating-system)
- [Frontend and Backend Examples](#-examples)
  - [In Frontend (React)](#in-frontend-react)
  - [In Backend (Express)](#in-backend-express)
- [Type Categories](#-type-categories)
  - [Common](#common-common)
  - [Auth](#auth-auth)
  - [User](#user-user)
  - [Category](#category-category)
  - [Product](#product-product)
  - [Bid](#bid-bid)
  - [Question](#question-question)
  - [Chat](#chat-chat)
  - [Order](#order-order)
  - [Rating](#rating-rating)
  - [Seller](#seller-seller)
  - [Admin](#admin-admin)
- [Development](#️-development)
- [Adding New Types](#-adding-new-types)
- [Best Practices](#-best-practices)
- [Migration Notes](#-migration-notes)
- [Validation](#-validation)
- [Contributing](#-contributing)
- [License](#-license)

## 📁 Package Structure

```text
src/
├── common/          # Base types (ApiResponse, Pagination, Enums)
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

## 🔄 Backend Model Alignment

All entity types now perfectly match their corresponding Drizzle ORM table definitions:

| Shared Type        | Backend Model            | Description                          |
| ------------------ | ------------------------ | ------------------------------------ |
| `User`             | `users` table            | User accounts with roles and ratings |
| `UpgradeRequest`   | `upgradeRequests` table  | Seller upgrade requests              |
| `OtpVerification`  | `otpVerifications` table | Email verification OTPs              |
| `Category`         | `categories` table       | Hierarchical product categories      |
| `Product`          | `products` table         | Auction products                     |
| `ProductImage`     | `productImages` table    | Product images                       |
| `ProductWatchList` | `watchLists` table       | User watch lists                     |
| `Bid`              | `bids` table             | Auction bids                         |
| `AutoBid`          | `autoBids` table         | Automatic bidding configuration      |
| `Order`            | `orders` table           | Purchase orders                      |
| `OrderPayment`     | `orderPayments` table    | Payment records                      |
| `Rating`           | `ratings` table          | User ratings (positive/negative)     |
| `ChatMessage`      | `chatMessages` table     | Private messages                     |
| `ProductQuestion`  | `productQuestions` table | Public Q&A                           |

## 🎯 Type Safety Features

- **String UUIDs**: All IDs are string UUIDs matching database
- **Decimal Precision**: Prices and amounts use strings to prevent floating-point issues
- **Exact Enums**: String literal types matching PostgreSQL enums
- **ISO Timestamps**: All dates as ISO 8601 strings
- **Nullable Fields**: Optional fields exactly match database nullable columns

## 🚀 Installation

This package is part of the monorepo workspace and will be automatically linked when you run:

```bash
pnpm install
```

## 📖 Usage

### Basic Import

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

## 🔧 Key Enum Types

All enums are centralized in `common/enums.ts` and match backend PostgreSQL enums:

```typescript
import type {
  UserRole, // "BIDDER" | "SELLER" | "ADMIN"
  AccountStatus, // "PENDING_VERIFICATION" | "ACTIVE" | "BANNED"
  ProductStatus, // "PENDING" | "ACTIVE" | "SOLD" | "NO_SALE" | "CANCELLED" | "SUSPENDED"
  OrderStatus, // "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED"
  PaymentMethod, // "COD" | "BANK_TRANSFER" | "CREDIT_CARD" | "EWALLET"
  BidStatus, // "VALID" | "INVALID"
  RatingScore, // 1 | -1 (positive/negative)
} from "@repo/shared-types";
```

## 💡 Important Type Considerations

### Decimal Values as Strings

All monetary amounts use strings to prevent floating-point precision issues:

```typescript
interface Product {
  startPrice: string; // "99.99" not 99.99
  stepPrice: string; // "5.00" not 5
  buyNowPrice?: string; // "199.99" not 199.99
}

interface Order {
  finalPrice: string; // "150.00"
  shippingCost: string; // "10.00"
  totalAmount: string; // "160.00"
}
```

### UUID Identifiers

All IDs are string UUIDs matching the database:

```typescript
interface User {
  id: string; // "123e4567-e89b-12d3-a456-426614174000"
  sellerId: string; // References users.id
}
```

### Rating System

The rating system uses a simple positive/negative approach:

```typescript
interface Rating {
  score: RatingScore; // 1 (positive) or -1 (negative)
  comment?: string;
}
```

## 📋 Examples

### In Frontend (React)

```typescript
import type {
  User,
  Product,
  ApiResponse,
  ProductStatus,
} from "@repo/shared-types";

// Fetching products with proper typing
const fetchProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await api.get("/products");
  return response.data;
};

// Using enums for status filtering
const activeProducts = products.filter((p) => p.status === "ACTIVE");
```

#### In Backend (Express)

```typescript
import type {
  User,
  CreateProductRequest,
  ApiResponse,
} from "@repo/shared-types";

app.post("/products", async (req, res) => {
  const productData: CreateProductRequest = req.body;

  const response: ApiResponse<Product> = {
    success: true,
    message: "Product created successfully",
    data: createdProduct,
  };

  res.json(response);
});
```

## 📚 Type Categories

### Common (`/common`)

Base types and centralized enums:

- **Response Types**: `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`
- **Pagination**: `PaginationParams`, `ProductSearchFilters`
- **Core Enums**: `UserRole`, `ProductStatus`, `OrderStatus`, `PaymentMethod`, etc.

### Auth (`/auth`)

Authentication and session management:

- `UserAuthData` - Current user session data
- `JwtPayload` - JWT token structure
- `SessionData` - Session information
- Request/Response types for login, register, password reset

### User (`/user`)

User profiles and account management:

- `User` - Full user entity matching backend users table
- `PublicProfile` - Public user information
- `UpgradeRequest` - Seller upgrade requests
- `OtpVerification` - Email verification

### Category (`/category`)

Product categorization with hierarchical structure:

- `Category` - Category entity with slug and hierarchy
- `CategoryWithChildren` - Tree structure support
- `CategoryTree` - Navigation tree format

### Product (`/product`)

Auction products and related data:

- `Product` - Core product entity
- `ProductListing` - Product with display information
- `ProductImage` - Product images with ordering
- `ProductWatchList` - User favorites

### Bid (`/bid`)

Bidding system:

- `Bid` - Individual bid records
- `AutoBid` - Automatic bidding configuration
- `BidWithUser` - Bid with user information

### Question (`/question`)

Product Q&A system:

- `ProductQuestion` - Q&A entries
- `ProductQuestionWithUsers` - With user details

### Chat (`/chat`)

Private messaging between users:

- `ChatMessage` - Individual messages
- `ChatConversation` - Conversation summaries

### Order (`/order`)

Order management and payments:

- `Order` - Order entity matching backend orders table
- `OrderPayment` - Payment records with transaction details
- `OrderWithDetails` - Order with product and user information

### Rating (`/rating`)

User rating system (positive/negative):

- `Rating` - Rating entity (score: 1 or -1)
- `RatingSummary` - User rating statistics

### Seller (`/seller`)

Seller-specific functionality:

- `SellerProfile` - Seller user with statistics
- `SellerUpgradeRequest` - Upgrade request details
- `SellerStats` - Dashboard statistics

### Admin (`/admin`)

Administrative functions:

- `AdminStats` - Dashboard statistics
- `AdminUser` - User with moderation fields
- `AdminProduct` - Product with admin information
- `AdminActivity` - Audit log entries

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

When adding new types that should match backend models:

1. **Check Backend First** - Ensure the Drizzle table exists and understand its structure

2. **Match Exactly** - Use the exact same field names, types, and nullability:

   ```typescript
   // Backend table
   export const users = pgTable("users", (t) => ({
     id: t.uuid("id").primaryKey(),
     email: t.text("email").notNull(),
     fullName: t.text("full_name").notNull(),
     ratingScore: t.real("rating_score").notNull().default(0),
   }));

   // Corresponding shared type
   export interface User {
     id: string;
     email: string;
     fullName: string;
     ratingScore: number;
   }
   ```

3. **Use String for Decimals** - All decimal/numeric fields should be strings:

   ```typescript
   // Backend
   startPrice: t.numeric("start_price", { precision: 15, scale: 2 });

   // Shared type
   startPrice: string;
   ```

4. **Export from Module** - Add to the appropriate module's index.ts:

   ```typescript
   // src/user/index.ts
   export * from "./entities";
   ```

5. **Centralize Enums** - Add new enums to `common/enums.ts` to match backend:

   ```typescript
   // Backend enum
   export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"]);

   // Shared type
   export type Status = "ACTIVE" | "INACTIVE";
   ```

## 🎯 Best Practices

1. **Backend First** - Always create/modify backend models before updating shared types
2. **Exact Matching** - Types must exactly match database schema (field names, nullability, types)
3. **String Decimals** - Use strings for all decimal/numeric database fields
4. **Centralized Enums** - Keep all enums in `common/enums.ts`
5. **UUID Strings** - All IDs are string UUIDs, never numbers
6. **ISO Timestamps** - All dates/times as ISO 8601 strings
7. **JSDoc Comments** - Document complex business logic and relationships

## 🔄 Migration Notes

### Breaking Changes Made

- **Decimal Fields**: All prices/amounts now strings instead of numbers
- **Rating System**: Changed from 1-5 scale to +1/-1 system
- **Enum Updates**: All enums now match backend PostgreSQL enums exactly
- **Field Names**: Some field name changes to match database schema
- **Required Fields**: Nullability now matches database constraints exactly

### Upgrading Existing Code

```typescript
// OLD (deprecated)
product.currentPrice = 99.99;
user.rating = 4.5;

// NEW (current)
product.currentPrice = "99.99";
user.ratingScore = 4.2;
user.ratingCount = 150;
```

## 📋 Validation

Types should be validated against actual API responses:

```typescript
import { z } from "zod";

// Runtime validation schema matching shared types
const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startPrice: z.string().regex(/^\d+\.\d{2}$/),
  status: z.enum([
    "PENDING",
    "ACTIVE",
    "SOLD",
    "NO_SALE",
    "CANCELLED",
    "SUSPENDED",
  ]),
});
```

## 🤝 Contributing

When contributing:

- **Backend Alignment**: Ensure all changes maintain alignment with backend Drizzle models
- **Type Safety**: Preserve strict type safety between frontend and backend
- **Documentation**: Update this README for any structural changes
- **Testing**: Run `pnpm build` to verify TypeScript compilation
- **Consistency**: Follow established patterns for decimal strings and UUID handling

## 📄 License

Part of the auction-online monorepo project.
