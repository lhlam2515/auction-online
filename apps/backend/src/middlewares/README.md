# Middlewares Directory

Thư mục này chứa các Express middleware functions xử lý logic trước khi đến controllers.

## 📁 Cấu trúc

```text
middlewares/
├── auth.middleware.ts       # Authentication & authorization
├── error-handler.ts        # Error handling & validation
├── rate-limiter.ts         # Rate limiting
├── validation.middleware.ts # Request validation
├── cors.middleware.ts      # CORS configuration
└── README.md              # File này
```

## 🎯 Mục đích

Middlewares chịu trách nhiệm:

- Authentication và authorization
- Request validation và sanitization
- Error handling và logging
- Rate limiting và security
- CORS và headers management
- Request/response transformation

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.middleware.ts`
- Tên file mô tả rõ chức năng: `auth.middleware.ts`, `error-handler.ts`

### Function naming

```typescript
// ✅ Recommended structure
export const middlewareName = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // middleware logic
};

// hoặc factory pattern
export const middlewareFactory = (options: Options) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // middleware logic
  };
};
```

### Code structure

```typescript
// ✅ Recommended structure
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/errors";

// Simple middleware
export const middlewareName = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Perform middleware logic
    // 2. Modify req/res if needed
    // 3. Call next() to continue
    next();
  } catch (error) {
    next(error);
  }
};

// Factory middleware với options
export const middlewareFactory = (options: MiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Implementation with options
  };
};

// Async middleware
export const asyncMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Async logic
    next();
  } catch (error) {
    next(error);
  }
};
```

## 🚀 Cách sử dụng

### Import middleware

```typescript
// Trong routes hoặc app.ts
import { authMiddleware } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/error-handler";

// Sử dụng globally
app.use(authMiddleware);

// Sử dụng cho specific route
router.post("/users", validateRequest(createUserSchema), createUser);

// Chain nhiều middlewares
router.get("/protected", authMiddleware, roleCheck("admin"), getUsers);
```

### Error handling trong middleware

```typescript
// ✅ Synchronous middleware
export const syncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Logic here
    next();
  } catch (error) {
    next(error); // Pass error to error handler
  }
};

// ✅ Asynchronous middleware
export const asyncMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Async logic here
    next();
  } catch (error) {
    next(error); // Pass error to error handler
  }
};
```

### Middleware patterns

#### Authentication middleware

```typescript
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("Token required");
  }

  // Verify token logic
  req.user = decodedUser;
  next();
};
```

#### Validation middleware

```typescript
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

#### Role-based access control

```typescript
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
};
```

## 🔧 Best Practices

- **Single Responsibility**: Mỗi middleware chỉ làm một việc cụ thể
- **Error Handling**: Luôn pass errors đến `next(error)`
- **Type Safety**: Sử dụng TypeScript cho type checking
- **Performance**: Avoid blocking operations trong middleware
- **Order Matters**: Thứ tự middleware rất quan trọng
- **Documentation**: JSDoc comments cho complex middlewares

## 📋 Checklist khi tạo middleware mới

- [ ] File name follow convention (kebab-case + .middleware.ts)
- [ ] Function signature đúng Express middleware format
- [ ] Proper error handling với try/catch và next(error)
- [ ] TypeScript types cho Request, Response, NextFunction
- [ ] JSDoc comments cho public functions
- [ ] Unit tests cho middleware logic
- [ ] Consider performance impact
- [ ] Handle edge cases appropriately

## 🎨 Example Templates

### Basic middleware

```typescript
import { Request, Response, NextFunction } from "express";

export const basicMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Middleware logic
  next();
};
```

### Factory middleware

```typescript
interface MiddlewareOptions {
  // Define options
}

export const factoryMiddleware = (options: MiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use options in logic
    next();
  };
};
```

### Async middleware

```typescript
export const asyncMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Async operations
    await someAsyncOperation();
    next();
  } catch (error) {
    next(error);
  }
};
```

## ⚡ Common Middleware Types

1. **Authentication**: Verify user identity
2. **Authorization**: Check user permissions
3. **Validation**: Validate request data
4. **Logging**: Log requests and responses
5. **Rate Limiting**: Prevent abuse
6. **CORS**: Handle cross-origin requests
7. **Security**: Add security headers
8. **Error Handling**: Catch and format errors
9. **Cache**: Cache responses
10. **Transform**: Modify request/response data
