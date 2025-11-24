# Routes Directory

Thư mục này chứa các Express route definitions và API endpoints.

## 📁 Cấu trúc

```text
routes/
├── index.ts           # Main router exports
├── auth.routes.ts     # Authentication routes
├── users.routes.ts    # User management routes
├── products.routes.ts # Product management routes
├── auctions.routes.ts # Auction management routes
├── bids.routes.ts     # Bidding routes
└── README.md         # File này
```

## 🎯 Mục đích

Routes chịu trách nhiệm:

- Define API endpoints và HTTP methods
- Route parameter validation
- Middleware integration
- Controller method mapping
- API versioning
- Route grouping và organization

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.routes.ts`
- Tên file theo resource: `users.routes.ts`, `products.routes.ts`
- File `index.ts` để export và combine routes

### Route structure

```typescript
// ✅ Recommended structure
import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { authMiddleware, validateRequest } from "@/middlewares";
import { createUserSchema, updateUserSchema } from "@/validations";

const router = Router();

// RESTful routes với proper naming
router.get("/", UserController.getUsers); // GET /users
router.get("/:id", UserController.getUser); // GET /users/:id
router.post("/", validateRequest(createUserSchema), UserController.createUser); // POST /users
router.put(
  "/:id",
  validateRequest(updateUserSchema),
  UserController.updateUser
); // PUT /users/:id
router.delete("/:id", UserController.deleteUser); // DELETE /users/:id

export default router;
```

### RESTful naming conventions

| HTTP Method | Route Pattern    | Controller Method | Description            |
| ----------- | ---------------- | ----------------- | ---------------------- |
| GET         | `/resources`     | `getResources`    | Get all resources      |
| GET         | `/resources/:id` | `getResource`     | Get single resource    |
| POST        | `/resources`     | `createResource`  | Create new resource    |
| PUT         | `/resources/:id` | `updateResource`  | Update entire resource |
| PATCH       | `/resources/:id` | `patchResource`   | Partial update         |
| DELETE      | `/resources/:id` | `deleteResource`  | Delete resource        |

### Code structure

```typescript
// ✅ Recommended structure
import { Router } from "express";

// Controllers
import { ResourceController } from "@/controllers/resource.controller";

// Middlewares
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/error-handler";

// Validations
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
} from "@/validations/resource.validation";

const router = Router();

/**
 * @route   GET /api/resources
 * @desc    Get all resources
 * @access  Public
 */
router.get(
  "/",
  validateRequest(resourceQuerySchema, "query"),
  ResourceController.getResources
);

/**
 * @route   GET /api/resources/:id
 * @desc    Get single resource
 * @access  Public
 */
router.get("/:id", ResourceController.getResource);

/**
 * @route   POST /api/resources
 * @desc    Create new resource
 * @access  Private (Auth required)
 */
router.post(
  "/",
  authMiddleware,
  validateRequest(createResourceSchema),
  ResourceController.createResource
);

/**
 * @route   PUT /api/resources/:id
 * @desc    Update resource
 * @access  Private (Owner or Admin)
 */
router.put(
  "/:id",
  authMiddleware,
  validateRequest(updateResourceSchema),
  ResourceController.updateResource
);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete resource
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  ResourceController.deleteResource
);

export default router;
```

## 🚀 Cách sử dụng

### Route registration

```typescript
// routes/index.ts
import { Router } from "express";
import userRoutes from "./users.routes";
import productRoutes from "./products.routes";
import auctionRoutes from "./auctions.routes";

const router = Router();

// Register routes với prefix
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/auctions", auctionRoutes);

export default router;
```

```typescript
// app.ts
import routes from "@/routes";

const app = express();

// Register all routes với API prefix
app.use("/api/v1", routes);
```

### Nested routes

```typescript
// Auction-related routes
const router = Router();

// Main auction routes
router.get("/", AuctionController.getAuctions);
router.post("/", AuctionController.createAuction);

// Nested bid routes
router.get("/:auctionId/bids", BidController.getAuctionBids);
router.post("/:auctionId/bids", BidController.createBid);

// Nested participants
router.get("/:auctionId/participants", AuctionController.getParticipants);
```

### Route parameters validation

```typescript
import { param } from "express-validator";

// UUID parameter validation
router.get(
  "/:id",
  param("id").isUUID().withMessage("Invalid ID format"),
  ResourceController.getResource
);

// Custom parameter validation với middleware
const validateResourceId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    throw new BadRequestError("Invalid resource ID");
  }
  next();
};

router.get("/:id", validateResourceId, ResourceController.getResource);
```

## 🔧 Best Practices

- **RESTful Design**: Follow REST principles cho consistent APIs
- **Middleware Order**: Đặt middlewares theo thứ tự logic
- **Parameter Validation**: Validate route parameters
- **Authentication**: Apply auth middlewares appropriately
- **Documentation**: JSDoc comments cho mỗi route
- **Error Handling**: Let middleware handle errors
- **Versioning**: Support API versioning từ đầu

### Middleware order

```typescript
// ✅ Correct middleware order
router.post(
  "/protected",
  authMiddleware, // 1. Authentication first
  requireRole(["USER"]), // 2. Authorization second
  validateRequest(schema), // 3. Validation third
  rateLimitMiddleware, // 4. Rate limiting
  controller.method // 5. Controller last
);
```

### Route grouping

```typescript
// Group related routes
const publicRoutes = Router();
publicRoutes.get("/health", HealthController.check);
publicRoutes.post("/auth/login", AuthController.login);

const protectedRoutes = Router();
protectedRoutes.use(authMiddleware); // Apply to all protected routes
protectedRoutes.get("/profile", UserController.getProfile);
protectedRoutes.put("/profile", UserController.updateProfile);

// Combine
const router = Router();
router.use("/public", publicRoutes);
router.use("/protected", protectedRoutes);
```

## 📋 Checklist khi tạo routes mới

- [ ] File name follow convention (kebab-case + .routes.ts)
- [ ] RESTful URL patterns
- [ ] Proper HTTP methods cho operations
- [ ] JSDoc comments cho mỗi route
- [ ] Authentication middleware where needed
- [ ] Input validation middleware
- [ ] Route parameter validation
- [ ] Consistent error handling
- [ ] Export router properly
- [ ] Update index.ts để register route
- [ ] Test all routes manually hoặc automated

## 🎨 Example Templates

### Basic resource routes

```typescript
import { Router } from "express";
import { ResourceController } from "@/controllers/resource.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/error-handler";
import { resourceSchema } from "@/validations/resource.validation";

const router = Router();

// Public routes
router.get("/", ResourceController.getResources);
router.get("/:id", ResourceController.getResource);

// Protected routes
router.use(authMiddleware); // All routes below require auth

router.post(
  "/",
  validateRequest(resourceSchema),
  ResourceController.createResource
);
router.put(
  "/:id",
  validateRequest(resourceSchema),
  ResourceController.updateResource
);
router.delete("/:id", ResourceController.deleteResource);

export default router;
```

### Complex nested routes

```typescript
import { Router } from "express";

const router = Router();

// Parent resource
router.get("/auctions", AuctionController.getAuctions);
router.post("/auctions", AuctionController.createAuction);

// Nested resources
router.get("/auctions/:auctionId/bids", BidController.getAuctionBids);
router.post("/auctions/:auctionId/bids", BidController.createBid);
router.get(
  "/auctions/:auctionId/participants",
  AuctionController.getParticipants
);

export default router;
```

## 📖 API Documentation

### Route documentation format

```typescript
/**
 * @route   [HTTP_METHOD] [ROUTE_PATH]
 * @desc    [Description]
 * @access  [Public/Private/Admin]
 * @param   {string} id - Resource identifier
 * @body    {Object} data - Request body data
 * @returns {Object} response - API response
 * @example
 * // Request
 * POST /api/users
 * {
 *   "email": "user@example.com",
 *   "fullName": "John Doe"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 */
```

### Status codes convention

- `200` - OK (GET, PUT successful)
- `201` - Created (POST successful)
- `204` - No Content (DELETE successful)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Auth required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `429` - Too Many Requests (Rate limited)
- `500` - Internal Server Error (Server errors)

## 🔄 API Versioning

```typescript
// Version trong URL path
router.use("/api/v1", v1Routes);
router.use("/api/v2", v2Routes);

// Version trong headers
app.use((req, res, next) => {
  const version = req.headers["api-version"] || "v1";
  req.apiVersion = version;
  next();
});
```
