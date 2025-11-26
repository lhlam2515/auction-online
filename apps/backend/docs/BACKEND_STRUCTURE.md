# 📁 Backend Structure Documentation

## 📋 Tổng Quan Cấu Trúc

Backend được tổ chức theo kiến trúc MVC (Model-View-Controller) với các layer rõ ràng:

```plaintext
src/
├── config/          # Configuration files (database, logger, etc.)
├── controllers/     # Request handlers and business logic
├── middlewares/     # Express middlewares (auth, validation, error handling)
├── models/          # Database models (Drizzle ORM)
├── routes/          # API route definitions
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── validations/     # Request validation schemas (Zod)
├── app.ts           # Express app setup
├── server.ts        # Server entry point
└── index.ts         # Application entry point
```

---

## 🗂️ Chi Tiết Từng Module

### 1. **Routes** (`src/routes/`)

Định nghĩa các API endpoints và kết nối với controllers, middlewares.

**Files:**

- `index.ts` - Main router, tập hợp tất cả routes
- `auth.routes.ts` - Authentication & Authorization endpoints
- `user.routes.ts` - User profile & account management
- `category.routes.ts` - Product categories
- `product.routes.ts` - Product listings (public & seller)
- `seller.routes.ts` - Seller-specific operations
- `bid.routes.ts` - Bidding and auto-bid management
- `question.routes.ts` - Product Q&A system
- `order.routes.ts` - Order management (post-auction)
- `chat.routes.ts` - Chat between winner and seller
- `rating.routes.ts` - Rating and feedback system
- `admin.routes.ts` - Admin dashboard and management

**Pattern:**

```typescript
import { Router } from "express";
import * as controller from "@/controllers/xxx.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as validation from "@/validations/xxx.validation";

const router = Router();

router.get(
  "/endpoint",
  authenticate, // Authentication check
  authorize("ROLE"), // Authorization check
  validate({ body: schema }), // Request validation
  controller.handlerFunction // Business logic
);

export default router;
```

---

### 2. **Controllers** (`src/controllers/`)

Xử lý business logic cho từng endpoint.

**Files:**

- `auth.controller.ts` - Login, register, password reset, OAuth
- `user.controller.ts` - Profile, watchlist, bidding history
- `category.controller.ts` - Category tree and products
- `product.controller.ts` - Product CRUD, search, filtering
- `seller.controller.ts` - Seller's product and order management
- `bid.controller.ts` - Place bid, auto-bid, kick bidder
- `question.controller.ts` - Ask/answer questions
- `order.controller.ts` - Order workflow (payment, shipping, completion)
- `chat.controller.ts` - Chat messages and notifications
- `rating.controller.ts` - Submit and view ratings
- `admin.controller.ts` - Admin operations (users, products, upgrades)

**Pattern:**

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";

export const handlerName = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract data from req.body, req.params, req.query
    // 2. Validate business rules
    // 3. Database operations
    // 4. Return response
    ResponseHandler.sendSuccess(res, data, statusCode);
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

---

### 3. **Middlewares** (`src/middlewares/`)

Xử lý các tác vụ trước khi request đến controller.

**Files:**

- `auth.ts` - Authentication & authorization
  - `authenticate()` - Verify JWT token
  - `authorize(...roles)` - Check user roles
  - `checkActiveAccount()` - Verify account status

- `validate.ts` - Request validation using Zod schemas
  - `validate({ body, params, query })` - Validate request data

- `error-handler.ts` - Global error handling
  - `notFound()` - 404 handler
  - `errorHandler()` - Centralized error response

---

### 4. **Validations** (`src/validations/`)

Định nghĩa validation schemas sử dụng Zod.

**Files:** (matching với routes)

- `auth.validation.ts`
- `user.validation.ts`
- `category.validation.ts`
- `product.validation.ts`
- `seller.validation.ts`
- `bid.validation.ts`
- `question.validation.ts`
- `order.validation.ts`
- `chat.validation.ts`
- `rating.validation.ts`
- `admin.validation.ts`

**Pattern:**

```typescript
import { z } from "zod";

export const createSchema = z.object({
  field: z.string().min(5, "Must be at least 5 characters"),
  email: z.string().email("Invalid email"),
  age: z.coerce.number().int().min(18),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

---

### 5. **Models** (`src/models/`)

Database schema definitions using Drizzle ORM.

**Files:**

- `users.model.ts` - Users and upgrade requests
- `products.model.ts` - Products, categories, images, watchlist
- `auction.model.ts` - Bids and auto-bid configurations
- `interactions.model.ts` - Ratings, chat, Q&A
- `order.model.ts` - Orders (post-auction)
- `enums.model.ts` - PostgreSQL enums
- `index.ts` - Export all models

---

### 6. **Types** (`src/types/`)

TypeScript type definitions.

**Files:**

- `model.ts` - Inferred types from Drizzle models
- `error.ts` - Error types and codes

---

### 7. **Utils** (`src/utils/`)

Helper functions and utilities.

**Files:**

- `errors.ts` - Custom error classes
  - `AppError`, `ValidationError`, `UnauthorizedError`,
  - `ForbiddenError`, `NotFoundError`, `ConflictError`
  - `BadRequestError`, `NotImplementedError`

- `response.ts` - Standardized API response format
  - `ResponseHandler.sendSuccess()`
  - `ResponseHandler.sendError()`

---

## 🔐 Authentication Flow

1. **Register/Login** → Generate JWT token
2. **Client stores token** (localStorage/cookie)
3. **Request with token** → `Authorization: Bearer <token>`
4. **authenticate middleware** → Verify token → Attach `req.user`
5. **authorize middleware** → Check user role
6. **Controller** → Access `req.user.id`, `req.user.role`

---

## ✅ Request Validation Flow

1. **Client sends request** with body/params/query
2. **validate middleware** → Parse with Zod schema
3. **If valid** → Sanitized data in `req.body`/`req.params`/`req.query`
4. **If invalid** → Return 400 with error details
5. **Controller** → Use validated data safely

---

## 🎯 Error Handling Flow

1. **Error occurs** in controller/middleware
2. **throw** or **next(error)**
3. **errorHandler middleware** catches error
4. **If AppError** → Return structured error response
5. **If unexpected error** → Log & return 500

---

## 📊 API Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

---

## 🚀 Quy Trình Implement Endpoint Mới

1. **Tạo validation schema** trong `validations/`
2. **Tạo controller function** trong `controllers/`
3. **Tạo route** trong `routes/` với middlewares phù hợp
4. **Test endpoint** với Postman/Thunder Client
5. **Update documentation**

---

## 📝 Coding Guidelines

1. **Always use TypeScript types** - No `any` type
2. **Validate all inputs** - Use Zod schemas
3. **Handle errors properly** - Use try-catch and custom error classes
4. **Use async/await** - No callbacks
5. **Follow naming conventions** - Consistent across the codebase
6. **Add JSDoc comments** - For public APIs
7. **Keep controllers thin** - Move complex logic to services (optional layer)
8. **Use transactions** - For multi-step database operations
9. **Log important events** - Use structured logging
10. **Security first** - Sanitize inputs, protect sensitive data

---

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email (optional)
SMTP_HOST=...
SMTP_PORT=587
```

---

## 📚 Next Steps

1. **Implement controller logic** - Currently all throw `NotImplementedError`
2. **Add database queries** - Use Drizzle ORM
3. **Implement JWT authentication** - In `auth.ts` middleware
4. **Add file upload** - For product images
5. **Integrate email service** - For password reset, notifications
6. **Add WebSocket** - For real-time chat and bidding
7. **Write tests** - Unit and integration tests
8. **Setup CI/CD** - Automated testing and deployment

---

## 🎓 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Zod Validation](https://zod.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Status:** ✅ Structure complete, ready for implementation
