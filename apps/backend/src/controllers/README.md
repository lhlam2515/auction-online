# Controllers Directory

Thư mục này chứa các controller xử lý business logic cho các API endpoints.

## 📁 Cấu trúc

```text
controllers/
├── auth.controller.ts      # Authentication & Authorization
├── user.controller.ts      # User management
├── product.controller.ts   # Product management
├── auction.controller.ts   # Auction management
├── bid.controller.ts       # Bidding operations
└── README.md              # File này
```

## 🎯 Mục đích

Controllers chịu trách nhiệm:

- Xử lý HTTP requests từ routes
- Validate input data
- Gọi services để xử lý business logic
- Format và trả về HTTP responses
- Handle errors appropriately

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.controller.ts`
- Tên file phải mô tả rõ resource: `user.controller.ts`, `auction.controller.ts`

### Class naming

```typescript
// ✅ Recommended structure
export class UserController {
  // controller methods
}

// hoặc sử dụng object
export const userController = {
  // controller methods
};
```

### Method naming

- Sử dụng HTTP verb + resource: `getUsers`, `createUser`, `updateUser`, `deleteUser`
- Async methods với async/await
- Type-safe parameters và responses

### Code structure

```typescript
// ✅ Recommended structure
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "@/utils/response";
import { asyncHandler } from "@/middlewares/error-handler";
// Import services, types, validations

export class UserController {
  // GET /users
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    // 1. Extract and validate query parameters
    // 2. Call service layer
    // 3. Return formatted response
    const users = await userService.getAllUsers();
    return ResponseHandler.sendSuccess(res, users);
  });

  // POST /users
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    // 1. Extract and validate body
    // 2. Call service layer
    // 3. Return formatted response
    const newUser = await userService.createUser(req.body);
    return ResponseHandler.sendCreated(res, newUser);
  });

  // PUT /users/:id
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Business logic...
  });

  // DELETE /users/:id
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Business logic...
  });
}
```

## 🚀 Cách sử dụng

### Import controller

```typescript
// Từ route files
import { UserController } from "@/controllers/user.controller";

// Sử dụng trong routes
router.get("/users", UserController.getUsers);
router.post("/users", UserController.createUser);
```

### Error handling

Controllers nên sử dụng `asyncHandler` để tự động catch errors:

```typescript
// ✅ Good - với asyncHandler
static getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUser(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return ResponseHandler.sendSuccess(res, user);
});
```

### Response formatting

Sử dụng `ResponseHandler` để standardize responses:

```typescript
// ✅ Success responses
ResponseHandler.sendSuccess(res, data, 200, "Success message");
ResponseHandler.sendCreated(res, data, "Created message");
ResponseHandler.sendNoContent(res);

// ✅ Error responses được handle bởi error middleware
throw new BadRequestError("Invalid input");
throw new NotFoundError("Resource not found");
```

## 🔧 Best Practices

- **Single Responsibility**: Mỗi controller chỉ handle một resource type
- **Thin Controllers**: Logic business nên ở service layer, không ở controller
- **Type Safety**: Sử dụng TypeScript interfaces cho request/response
- **Error Handling**: Luôn sử dụng `asyncHandler` và throw appropriate errors
- **Validation**: Validate input ở middleware hoặc controller level
- **Documentation**: JSDoc comments cho public methods

## 📋 Checklist khi tạo controller mới

- [ ] File name follow convention (kebab-case + .controller.ts)
- [ ] Class/object name follow convention (PascalCase + Controller)
- [ ] Methods use asyncHandler wrapper
- [ ] Proper error handling với custom error classes
- [ ] Use ResponseHandler for consistent responses
- [ ] TypeScript interfaces for request/response types
- [ ] JSDoc comments cho public methods
- [ ] Import statements organized properly
- [ ] Follow RESTful naming conventions

## 🎨 Example Template

```typescript
import { Request, Response } from "express";
import { ResponseHandler } from "@/utils/response";
import { asyncHandler } from "@/middlewares/error-handler";
import { BadRequestError, NotFoundError } from "@/utils/errors";

export class ResourceController {
  /**
   * Get all resources
   * GET /resources
   */
  static getResources = asyncHandler(async (req: Request, res: Response) => {
    // Implementation
  });

  /**
   * Get resource by ID
   * GET /resources/:id
   */
  static getResource = asyncHandler(async (req: Request, res: Response) => {
    // Implementation
  });

  /**
   * Create new resource
   * POST /resources
   */
  static createResource = asyncHandler(async (req: Request, res: Response) => {
    // Implementation
  });

  /**
   * Update existing resource
   * PUT /resources/:id
   */
  static updateResource = asyncHandler(async (req: Request, res: Response) => {
    // Implementation
  });

  /**
   * Delete resource
   * DELETE /resources/:id
   */
  static deleteResource = asyncHandler(async (req: Request, res: Response) => {
    // Implementation
  });
}
```
