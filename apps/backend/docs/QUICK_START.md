# 🚀 Quick Start Guide

## 📁 File Organization

### Khi nào cần tạo file mới?

#### 1. **Route mới** (`src/routes/`)

- Tạo khi bạn muốn thêm một nhóm endpoint mới
- Format: `{feature}.routes.ts`
- Ví dụ: `notification.routes.ts`, `payment.routes.ts`

#### 2. **Controller mới** (`src/controllers/`)

- Tạo tương ứng với mỗi route file
- Format: `{feature}.controller.ts`
- Ví dụ: `notification.controller.ts`, `payment.controller.ts`

#### 3. **Validation mới** (`src/validations/`)

- Tạo tương ứng với mỗi route/controller
- Format: `{feature}.validation.ts`
- Ví dụ: `notification.validation.ts`, `payment.validation.ts`

#### 4. **Model mới** (`src/models/`)

- Tạo khi cần thêm table mới vào database
- Format: `{entity}.model.ts`
- Ví dụ: `notifications.model.ts`, `payments.model.ts`

---

## ⚡ Template Nhanh

### 1. Tạo Route File

```typescript
import { Router } from "express";
import * as controller from "@/controllers/feature.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as validation from "@/validations/feature.validation";

const router = Router();

/**
 * @route   GET /api/feature
 * @desc    Description of what this does
 * @access  Public/Private (Role)
 */
router.get(
  "/",
  // authenticate,                     // Uncomment if needs auth
  // authorize("ROLE"),                // Uncomment if needs specific role
  // validate({ query: validation.getSchema }), // Uncomment if needs validation
  controller.getAll
);

/**
 * @route   POST /api/feature
 * @desc    Create new resource
 * @access  Private (Role)
 */
router.post(
  "/",
  authenticate,
  authorize("ROLE"),
  validate({ body: validation.createSchema }),
  controller.create
);

export default router;
```

### 2. Tạo Controller File

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement logic
    throw new NotImplementedError("Get all not implemented yet");
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const userId = req.user?.id;

    // TODO: Implement logic

    ResponseHandler.sendSuccess(res, { data }, 201);
  } catch (error) {
    next(error);
  }
};
```

### 3. Tạo Validation File

```typescript
import { z } from "zod";

export const idSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
```

### 4. Tạo Model File

```typescript
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.model";

export const tableName = pgTable("table_name", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

---

## 🔄 Quy Trình Thêm Endpoint Mới

### Bước 1: Tạo Validation Schema

```bash
# File: src/validations/feature.validation.ts
```

### Bước 2: Tạo Controller

```bash
# File: src/controllers/feature.controller.ts
```

### Bước 3: Tạo Route

```bash
# File: src/routes/feature.routes.ts
```

### Bước 4: Import vào routes/index.ts

```typescript
import featureRoutes from "./feature.routes";

router.use("/feature", featureRoutes);
```

### Bước 5: Test

```bash
# Sử dụng Postman, Thunder Client, hoặc curl
curl http://localhost:3000/api/feature
```

---

## 🎯 Implement Controller Logic

### Pattern cơ bản

```typescript
export const functionName = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract data
    const { id } = req.params;
    const data = req.body;
    const userId = req.user?.id;
    const { page, limit } = req.query;

    // 2. Validate business rules
    if (!someCondition) {
      throw new BadRequestError("Error message");
    }

    // 3. Database operations
    // const result = await db.select().from(table);

    // 4. Return response
    ResponseHandler.sendSuccess(res, { result });
  } catch (error) {
    next(error);
  }
};
```

---

## 🛡️ Common Middlewares

### Authentication

```typescript
router.get("/protected", authenticate, controller.handler);
```

### Authorization

```typescript
router.get("/admin", authenticate, authorize("ADMIN"), controller.handler);
```

### Validation

```typescript
router.post(
  "/create",
  validate({ body: validation.createSchema }),
  controller.create
);
```

### Multiple Middlewares

```typescript
router.put(
  "/:id",
  authenticate,
  authorize("SELLER", "ADMIN"),
  validate({
    params: validation.idSchema,
    body: validation.updateSchema,
  }),
  controller.update
);
```

---

## 🚨 Error Handling

### Throwing Errors

```typescript
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "@/utils/errors";

// Bad request (400)
throw new BadRequestError("Invalid input");

// Not found (404)
throw new NotFoundError("User");

// Unauthorized (401)
throw new UnauthorizedError("Token expired");

// Forbidden (403)
throw new ForbiddenError("Access denied");

// Conflict (409)
throw new ConflictError("Email already exists");
```

---

## 📝 Response Format

### Success Response

```typescript
ResponseHandler.sendSuccess(res, data, 200);
// Output:
// {
//   "success": true,
//   "data": { ... },
//   "message": "Success"
// }
```

### Custom Message

```typescript
ResponseHandler.sendSuccess(
  res,
  { data },
  201,
  "Resource created successfully"
);
```

---

## 🎓 Best Practices

1. ✅ **Always validate input** - Use Zod schemas
2. ✅ **Use try-catch** - In all async controllers
3. ✅ **Check permissions** - Use authorize middleware
4. ✅ **Sanitize data** - Validation does this automatically
5. ✅ **Return consistent responses** - Use ResponseHandler
6. ✅ **Log errors** - Already handled by error middleware
7. ✅ **Use transactions** - For multi-step DB operations
8. ✅ **Document your APIs** - Add JSDoc comments
9. ✅ **Test endpoints** - Before marking as done
10. ✅ **Keep it simple** - Don't over-engineer

---

## 🔍 Quick Reference

### Get User Info

```typescript
const userId = req.user?.id;
const userRole = req.user?.role;
const userEmail = req.user?.email;
```

### Query Parameters

```typescript
const { page, limit, sort } = req.query;
```

### Path Parameters

```typescript
const { id } = req.params;
```

### Request Body

```typescript
const data = req.body;
```

---

## 🐛 Debugging Tips

1. Check validation errors first
2. Console.log req.body, req.params, req.query
3. Check if middleware order is correct
4. Verify token is being sent
5. Check database connection
6. Look at error logs

---

## ✨ Next Steps

Bây giờ bạn có thể:

1. Implement các controller functions (thay thế `NotImplementedError`)
2. Thêm database queries với Drizzle ORM
3. Test từng endpoint một
4. Thêm WebSocket cho real-time features
5. Implement email notifications

Good luck! 🚀
