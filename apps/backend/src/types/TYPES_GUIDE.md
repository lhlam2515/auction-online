# Backend Type Definitions

## Overview

This folder contains backend-specific type definitions that extend or complement types from `@repo/shared-types`.

## Structure

- **`api.ts`** - Response structure and pagination types
- **`error.ts`** - Error handling types and codes
- **`model.ts`** - Database model types (Drizzle ORM inference)

## Usage Philosophy

### Use Shared Types First

All API request/response types should come from `@repo/shared-types`:

```typescript
import type { RegisterRequest, LoginResponse } from "@repo/shared-types";

// ✅ Good - Use shared types
const body = req.body as RegisterRequest;
```

### Backend-Specific Types

Types in this folder are for:

1. **Internal Utilities** - Response builders, pagination helpers
2. **Error Handling** - Backend-specific error structures with stack traces
3. **Database Models** - Drizzle ORM inferred types

```typescript
// ✅ Good - Backend-specific utilities
import { ErrorResponse, SuccessResponse } from "@/types/error";
import { Paginated } from "@/types/api";
import { User, UserRole } from "@/types/model";
```

## File Details

### `api.ts`

**Purpose**: Response structure and pagination types for internal use.

**Exports**:

- `PaginatedResponse` (re-exported from shared-types)
- `PaginationMeta` - Backend pagination metadata structure
- `Paginated<T>` - Internal paginated response builder type

**Usage**:

```typescript
import { Paginated, PaginationMeta } from "@/types/api";

// Used in utils/pagination.ts to build responses
const result: Paginated<Product> = {
  items: products,
  pagination: { page: 1, pageSize: 20, total: 100, totalPages: 5 },
};
```

### `error.ts`

**Purpose**: Error handling types and standard error codes.

**Exports**:

- `ApiResponse` (re-exported from shared-types)
- `ErrorResponse` - Backend error response with stack trace
- `SuccessResponse<T>` - Backend success response
- `BackendApiResponse<T>` - Union type for responses
- `AppErrorOptions` - Options for creating custom errors
- `ErrorCodes` - Standard error codes enum

**Usage**:

```typescript
import { ErrorResponse, SuccessResponse, ErrorCodes } from "@/types/error";

// Used in ResponseHandler
class ResponseHandler {
  static sendSuccess<T>(res: Response, data: T): Response<SuccessResponse<T>> {
    return res.status(200).json({ success: true, data });
  }
}
```

### `model.ts`

**Purpose**: Database model types inferred from Drizzle ORM schemas.

**Exports**:

- All database entity types: `User`, `Product`, `Order`, `Bid`, etc.
- Insert types: `NewUser`, `NewProduct`, etc.
- Enums: `UserRole`, etc.

**Usage**:

```typescript
import { User, UserRole } from "@/types/model";

// Used in auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}
```

## Migration Notes

### What Changed

After migration to `@repo/shared-types`:

- ✅ **Removed**: Duplicate API request/response types (they now live in shared-types)
- ✅ **Kept**: Backend-specific utilities (error handling, pagination builders, DB types)
- ✅ **Added**: Re-exports from shared-types for convenience

### Why Keep These Types?

1. **`api.ts` & `error.ts`**: Backend needs extended response structures with timestamps, stack traces, and paths that aren't needed on frontend.

2. **`model.ts`**: Database types are backend-specific and come from Drizzle ORM inference, not API contracts.

3. **Backward Compatibility**: Existing utils and middleware depend on these types.

## Best Practices

### ✅ DO

- Import API types from `@repo/shared-types`
- Use backend types for internal utilities
- Extend shared types when backend needs additional fields

```typescript
// ✅ Controller - Use shared types
import type { RegisterRequest } from "@repo/shared-types";
const body = req.body as RegisterRequest;

// ✅ Utility - Use backend types
import { ErrorResponse } from "@/types/error";
function sendError(): ErrorResponse { ... }
```

### ❌ DON'T

- Don't create duplicate API types in this folder
- Don't export API request/response types from here
- Don't import these types in controllers for request handling

```typescript
// ❌ Bad - Don't create duplicate types
export interface RegisterRequest { ... }

// ❌ Bad - Import from shared-types instead
import { RegisterRequest } from "@/types/api";
```

## Related Documentation

- [Shared Types Package](../../../../packages/shared-types/README.md)
- [Frontend Types](../../../frontend/app/types/api.ts)
- [Controllers](../controllers/README.md)
