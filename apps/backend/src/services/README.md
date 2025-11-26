# Services Directory

Thư mục này chứa business logic layer, xử lý domain rules và data operations.

## 📁 Cấu trúc

```text
services/
├── index.ts              # Service exports
├── auth.service.ts       # Authentication & authorization
├── user.service.ts       # User management
├── product.service.ts    # Product management
├── auction.service.ts    # Auction management
├── bid.service.ts        # Bidding operations
└── README.md            # File này
```

## 🎯 Mục đích

Services chịu trách nhiệm:

- Encapsulate business logic và domain rules
- Xử lý database operations và transactions
- Integrate với external services (email, payment, storage)
- Provide reusable methods cho controllers, jobs, sockets
- Keep logic testable và decoupled từ HTTP layer
- Data transformation và validation

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.service.ts`
- Tên file theo domain: `auth.service.ts`, `product.service.ts`

### Class naming

```typescript
// ✅ Recommended structure
export class UserService {
  // service methods
}

// Export singleton instance
export const userService = new UserService();
```

### Method naming

- Sử dụng domain-oriented names: `getUserById`, `createUser`, `updateUserProfile`
- Async methods với async/await
- Return plain data, không return Express Response types
- Throw domain errors cho error handling

### Code structure

```typescript
// ✅ Recommended structure
import { db } from "@/config/database";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from "@/utils/errors";
import type { User, CreateUserInput, UpdateUserInput } from "@/types";

export class UserService {
  /**
   * Get user by ID
   * @throws NotFoundError if user doesn't exist
   */
  async getUserById(id: string): Promise<User> {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Create new user
   * @throws ConflictError if email already exists
   */
  async createUser(input: CreateUserInput): Promise<User> {
    // Check if email exists
    const existing = await this.getUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    // Create user in transaction
    const [newUser] = await db.insert(users).values(input).returning();

    return newUser;
  }

  /**
   * Update user profile
   * @throws NotFoundError if user doesn't exist
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.getUserById(id);

    const [updated] = await db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete user
   * @throws NotFoundError if user doesn't exist
   */
  async deleteUser(id: string): Promise<void> {
    await this.getUserById(id); // Ensure exists

    await db.delete(users).where(eq(users.id, id));
  }

  // Private helper methods
  private async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  }
}

// Export singleton
export const userService = new UserService();
```

## 🚀 Cách sử dụng

### Import service

```typescript
// Trong controllers
import { userService } from "@/services/user.service";
// hoặc
import { userService } from "@/services";

// Sử dụng trong controller
export class UserController {
  static getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return ResponseHandler.sendSuccess(res, user);
  });
}
```

### Transaction handling

Services nên handle complex transactions:

```typescript
export class OrderService {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    return db.transaction(async (tx) => {
      // 1. Create order
      const [order] = await tx.insert(orders).values(input).returning();

      // 2. Create order items
      await tx.insert(orderItems).values(
        input.items.map((item) => ({
          orderId: order.id,
          ...item,
        }))
      );

      // 3. Update product stock
      for (const item of input.items) {
        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      return order;
    });
  }
}
```

### Error handling

Services throw domain-specific errors:

```typescript
// ✅ Good - Throw domain errors
async getUserById(id: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

// ✅ Good - Validate business rules
async createBid(input: CreateBidInput): Promise<Bid> {
  const auction = await auctionService.getById(input.auctionId);

  if (auction.status !== 'ACTIVE') {
    throw new BadRequestError('Auction is not active');
  }

  if (input.amount <= auction.currentPrice) {
    throw new BadRequestError('Bid must be higher than current price');
  }

  // Create bid...
}
```

### Data transformation

Services transform data appropriately:

```typescript
export class UserService {
  async getUserProfile(id: string): Promise<UserProfile> {
    const user = await this.getUserById(id);

    // Transform và exclude sensitive data
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      // Don't include: password, resetToken, etc.
    };
  }

  async getUserWithStats(id: string): Promise<UserWithStats> {
    const user = await this.getUserById(id);

    // Aggregate related data
    const [stats] = await db
      .select({
        totalProducts: count(products.id),
        totalBids: count(bids.id),
        wonAuctions: count(auctions.id),
      })
      .from(users)
      .leftJoin(products, eq(products.sellerId, users.id))
      .leftJoin(bids, eq(bids.userId, users.id))
      .leftJoin(auctions, eq(auctions.winnerId, users.id))
      .where(eq(users.id, id));

    return {
      ...user,
      stats,
    };
  }
}
```

## 🔧 Best Practices

- **Single Responsibility**: Mỗi service class handle một domain cụ thể
- **No HTTP Dependencies**: Không import `Request`, `Response`, hoặc Express types
- **Pure Business Logic**: Tất cả domain rules và validations ở đây
- **Transaction Boundaries**: Wrap multi-step operations trong transactions
- **Error Handling**: Throw domain-specific errors, không return error objects
- **Type Safety**: Strong typing cho inputs và outputs
- **Testability**: Easy to unit test without HTTP mocking
- **Reusability**: Methods có thể được gọi từ controllers, jobs, sockets
- **Documentation**: JSDoc comments cho public methods

## 📋 Checklist khi tạo service mới

- [ ] File name follow convention (kebab-case + .service.ts)
- [ ] Class name follow convention (PascalCase + Service)
- [ ] Export singleton instance
- [ ] No Express types (`req`, `res`, `next`)
- [ ] Throw domain errors (BadRequestError, NotFoundError, etc.)
- [ ] Use transactions for multi-step operations
- [ ] TypeScript interfaces cho inputs/outputs
- [ ] JSDoc comments cho public methods
- [ ] Private helper methods cho internal logic
- [ ] Export types và interfaces
- [ ] Update `src/services/index.ts`
- [ ] Write unit tests
