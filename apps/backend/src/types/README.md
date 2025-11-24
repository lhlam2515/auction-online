# Types Directory

Thư mục này chứa các TypeScript type definitions và interfaces cho toàn bộ ứng dụng.

## 📁 Cấu trúc

```text
types/
├── error.ts        # Error-related types
├── model.ts        # Database model types
├── auth.ts         # Authentication types
├── api.ts          # API request/response types
├── common.ts       # Common utility types
├── index.ts        # Export tất cả types
└── README.md       # File này
```

## 🎯 Mục đích

Types chịu trách nhiệm:

- Type safety cho toàn bộ application
- Interface definitions cho API contracts
- Custom utility types
- Error type definitions
- Database model type extensions
- Request/Response typing

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.ts` (không cần `.types.ts`)
- Tên file theo domain: `auth.ts`, `api.ts`
- File `index.ts` để export tất cả types

### Type naming

```typescript
// ✅ Recommended naming
export interface UserProfile {
  // PascalCase for interfaces
  // properties
}

export type UserId = string; // PascalCase for type aliases

export type UserRole = "ADMIN" | "USER"; // PascalCase for union types

export enum ApiStatus {
  // PascalCase for enums
  SUCCESS = "success",
  ERROR = "error",
}
```

### Code structure

```typescript
// ✅ Recommended structure
// 1. Import dependencies
import { z } from "zod";

// 2. Base types và interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Specific domain types
export interface User extends BaseEntity {
  email: string;
  fullName: string;
  role: UserRole;
}

// 4. Union types
export type UserRole = "BIDDER" | "SELLER" | "ADMIN";
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// 5. Utility types
export type CreateUser = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUser = Partial<CreateUser>;

// 6. Generic types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// 7. Type guards
export const isUser = (obj: any): obj is User => {
  return (
    obj && typeof obj.email === "string" && typeof obj.fullName === "string"
  );
};
```

## 🚀 Cách sử dụng

### Import types

```typescript
// Import specific types
import { User, CreateUser, UserRole } from "@/types/auth";
import { ApiResponse, ErrorResponse } from "@/types/api";

// Import all types
import * as Types from "@/types";

// Type-only imports (recommended)
import type { User } from "@/types/auth";
```

### Type usage trong functions

```typescript
// Function parameters và return types
const createUser = async (userData: CreateUser): Promise<User> => {
  // Implementation
};

// Generic functions
const fetchResource = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  // Implementation
};
```

### Type usage trong Express

```typescript
import { Request, Response } from "express";
import { User, CreateUser } from "@/types/auth";

// Extend Express types
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Controller type safety
const getUserProfile = (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<User>>
) => {
  // Type-safe implementation
};
```

## 📝 Common Type Patterns

### API Response Types

```typescript
// api.ts
export interface BaseResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface SuccessResponse<T> extends BaseResponse {
  success: true;
  data: T;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    name: string;
    message: string;
    code: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### Database Model Types

```typescript
// model.ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users, products } from "@/models";

// Generated types từ Drizzle schema
export type User = InferSelectModel<typeof users>;
export type Product = InferSelectModel<typeof products>;

// Input types cho operations
export type CreateUser = InferInsertModel<typeof users>;
export type UpdateUser = Partial<Omit<CreateUser, "id" | "createdAt">>;

// Custom utility types
export type UserWithProducts = User & {
  products: Product[];
};
```

### Authentication Types

```typescript
// auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthContext {
  user: User;
  token: string;
  refreshToken?: string;
}

export type UserRole = "BIDDER" | "SELLER" | "ADMIN";
```

### Error Types

```typescript
// error.ts
export interface ErrorDetails {
  field?: string;
  code?: string;
  message: string;
}

export interface AppErrorInfo {
  name: string;
  message: string;
  statusCode: number;
  code: string;
  details?: ErrorDetails[];
  stack?: string;
}

export enum ErrorCodes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
```

## 🔧 Best Practices

### Type safety

```typescript
// ✅ Use strict typing
interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: UserRole; // Optional with union type
}

// ❌ Avoid any
interface BadRequest {
  data: any; // Don't do this
}
```

### Utility Types

```typescript
// Leverage TypeScript utility types
export type CreateUser = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUser = Partial<CreateUser>;
export type UserKeys = keyof User;
export type UserEmail = Pick<User, "email">;

// Custom utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

### Generic Types

```typescript
// Reusable generic interfaces
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Usage
const userRepository: Repository<User> = new UserRepositoryImpl();
```

### Type Guards

```typescript
// Type guard functions
export const isUser = (obj: unknown): obj is User => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "email" in obj &&
    "fullName" in obj
  );
};

export const isErrorResponse = (
  response: ApiResponse<any>
): response is ErrorResponse => {
  return !response.success;
};

// Usage
if (isErrorResponse(response)) {
  console.error(response.error.message); // Type-safe
}
```

## 📋 Checklist khi tạo types mới

- [ ] File name follow convention (kebab-case + .ts)
- [ ] Interface/Type names in PascalCase
- [ ] Proper JSDoc comments for complex types
- [ ] Use TypeScript utility types where appropriate
- [ ] Export types từ index.ts
- [ ] Type guards for runtime checking nếu cần
- [ ] Generic types for reusability
- [ ] Avoid `any` type - use `unknown` instead
- [ ] Consider making fields readonly where appropriate

## 🎨 Example Templates

### Basic interface

```typescript
/**
 * Represents a [description]
 */
export interface ResourceName {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### API types

```typescript
// Request types
export interface CreateResourceRequest {
  name: string;
  description: string;
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
}

// Response types
export interface ResourceResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO string trong API
  updatedAt: string;
}

// Paginated response
export interface PaginatedResourceResponse {
  data: ResourceResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Enum alternatives

```typescript
// Instead of enum, use const assertion
export const USER_ROLES = {
  BIDDER: "BIDDER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// hoặc union type trực tiếp
export type UserRole = "BIDDER" | "SELLER" | "ADMIN";
```

## 🔍 Advanced Patterns

### Conditional Types

```typescript
// Conditional type based on user role
export type UserPermissions<T extends UserRole> = T extends "ADMIN"
  ? AdminPermissions
  : T extends "SELLER"
    ? SellerPermissions
    : BidderPermissions;
```

### Mapped Types

```typescript
// Make all properties optional và string
export type StringifyOptional<T> = {
  [K in keyof T]?: string;
};

// Usage: Convert User to form data
export type UserFormData = StringifyOptional<CreateUser>;
```

### Template Literal Types

```typescript
// API endpoint types
export type ApiEndpoint = `/api/v1/${string}`;
export type UserEndpoint = `/api/v1/users/${string}`;

// Event types
export type UserEvent = `user:${string}`;
export type AuctionEvent = `auction:${string}`;
```
