# Services Directory

Business logic layer cho auction system - xử lý domain rules và data operations.

## 📋 Mục lục

- [Cấu trúc Service](#-cấu-trúc-service)
- [Cách sử dụng](#-cách-sử-dụng)
- [Service hiện có](#️-service-hiện-có)
- [Quy tắc phát triển](#-quy-tắc-phát-triển)
- [Best Practices](#-best-practices)

## 📁 Cấu trúc Service

```text
services/
├── index.ts              # Export tất cả services
├── auth.service.ts       # Authentication & JWT
├── user.service.ts       # User management
├── product.service.ts    # Product & auction management
├── bid.service.ts        # Bidding operations
├── order.service.ts      # Order processing
├── rating.service.ts     # Rating & feedback
├── chat.service.ts       # Chat messaging
├── question.service.ts   # Q&A system
├── category.service.ts   # Product categories
└── README.md            # Documentation
```

## 🚀 Cách sử dụng

### Import Service

```typescript
// Import specific service
import { userService } from "@/services";
import { productService } from "@/services/product.service";

// Sử dụng trong controller
export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await userService.getById(req.user.id);
    return ResponseHandler.sendSuccess(res, user);
  }
);
```

### Cấu trúc Service chuẩn

```typescript
import { db } from "@/config/database";
import { NotFoundError, BadRequestError } from "@/utils/errors";
import type { User, CreateUserRequest } from "@repo/shared-types";

export class UserService {
  // Plain parameters cho simple operations
  async getById(userId: string): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  // Shared types cho complex data
  async create(
    email: string,
    password: string,
    fullName: string
  ): Promise<User> {
    // Validation & business logic
    const hashedPassword = await hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({ email, password: hashedPassword, fullName })
      .returning();

    return newUser;
  }
}

export const userService = new UserService();
```

## 🏗️ Service hiện có

| Service             | Mô tả                   | Key Methods                                        |
| ------------------- | ----------------------- | -------------------------------------------------- |
| **AuthService**     | Đăng nhập, đăng ký, JWT | `register()`, `login()`, `refreshToken()`          |
| **UserService**     | Quản lý user, profile   | `getById()`, `updateProfile()`, `changePassword()` |
| **ProductService**  | Sản phẩm, auction       | `create()`, `search()`, `getById()`                |
| **BidService**      | Đấu giá, auto-bid       | `placeBid()`, `createAutoBid()`, `kickBidder()`    |
| **OrderService**    | Xử lý đơn hàng          | `createFromAuction()`, `updatePaymentInfo()`       |
| **RatingService**   | Đánh giá, feedback      | `create()`, `getSellerStats()`                     |
| **ChatService**     | Chat messaging          | `sendMessage()`, `getChatHistory()`                |
| **QuestionService** | Q&A system              | `askQuestion()`, `answerQuestion()`                |
| **CategoryService** | Danh mục sản phẩm       | `getTree()`, `getProductsByCategory()`             |

## 📜 Quy tắc phát triển

### 1. Naming Convention

```typescript
// ✅ File naming: kebab-case
auth.service.ts;
product.service.ts;

// ✅ Class naming: PascalCase + Service
export class AuthService {}
export class ProductService {}

// ✅ Export singleton
export const authService = new AuthService();
```

### 2. Method Parameters

```typescript
// ✅ Plain parameters for simple data (≤4 params)
async updateProfile(userId: string, fullName?: string, address?: string)

// ✅ Objects for complex data or filters
async search(filters: ProductSearchParams): Promise<PaginatedResponse<Product>>
```

### 3. Error Handling

```typescript
// ✅ Throw domain-specific errors
if (!user) {
  throw new NotFoundError("User not found");
}

if (auction.status !== "ACTIVE") {
  throw new BadRequestError("Auction is not active");
}
```

### 4. Shared Types Integration

```typescript
// ✅ Import from shared-types package
import type {
  CreateProductRequest,
  PaginatedResponse,
  ProductSearchParams
} from "@repo/shared-types";

// ✅ Use shared types for consistency
async create(sellerId: string, data: CreateProductRequest): Promise<Product>
```

## ⚡ Best Practices

### ✅ DO

- Sử dụng **shared types** từ `@repo/shared-types`
- **Plain parameters** cho simple operations
- **Transactions** cho multi-step operations
- **Domain errors** thay vì generic errors
- **JSDoc comments** cho public methods
- **Async/await** pattern

### ❌ DON'T

- Import Express types (`Request`, `Response`)
- Return HTTP status codes từ service
- Handle HTTP-specific logic
- Hardcode business rules
- Use `any` type

### Transaction Example

```typescript
async createOrder(productId: string, winnerId: string, finalPrice: number) {
  return db.transaction(async (tx) => {
    // 1. Create order
    const [order] = await tx.insert(orders)
      .values({ productId, winnerId, finalPrice })
      .returning();

    // 2. Update product status
    await tx.update(products)
      .set({ status: 'SOLD' })
      .where(eq(products.id, productId));

    return order;
  });
}
```

### Error Handling Pattern

```typescript
async placeBid(productId: string, userId: string, amount: number) {
  const product = await this.getById(productId);

  if (product.status !== 'ACTIVE') {
    throw new BadRequestError('Auction is not active');
  }

  if (amount <= product.currentPrice) {
    throw new BadRequestError('Bid must be higher than current price');
  }

  // Place bid logic...
}
```

## 🔧 Development Workflow

1. **Tạo service mới**: Follow naming convention
2. **Import shared types**: Sử dụng từ `@repo/shared-types`
3. **Implement methods**: Plain parameters + domain errors
4. **Export singleton**: `export const serviceNae = new ServiceClass()`
5. **Update index.ts**: Export service từ index file
6. **Write tests**: Unit test cho business logic

---

📚 **Tham khảo thêm**: Xem source code của các service hiện có để hiểu pattern và best practices.
