# Database Models - Auction Platform

## 📋 Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Naming Conventions](#naming-conventions)
- [Usage Examples](#usage-examples)
- [Quick Reference](#quick-reference)

## Overview

Optimized database schema cho hệ thống đấu giá trực tuyến với Drizzle ORM và PostgreSQL. Schema được tối ưu hóa cho hiệu suất, tích hợp Supabase Auth, và giảm thiểu indexes không cần thiết.

## File Structure

### Core Models

```text
src/models/
├── enums.model.ts        # Enum definitions
├── users.model.ts        # Users & upgrade requests (Supabase Auth optimized)
├── products.model.ts     # Products, categories, images
├── auction.model.ts      # Bidding system & auto-bids
├── interactions.model.ts # Ratings, chat, Q&A
├── order.model.ts        # Order & payment management
├── relations.ts          # Table relationships
└── index.ts              # Exports
```

## Naming Conventions

| Element   | Convention             | Example          |
| --------- | ---------------------- | ---------------- |
| Files     | kebab-case + .model.ts | `users.model.ts` |
| Tables    | snake_case, plural     | `product_images` |
| Columns   | snake_case             | `full_name`      |
| Variables | camelCase              | `productImages`  |

## Usage Examples

### Import & Basic Operations

```typescript
// Import
import { users, products } from "@/models";
import { User, Product } from "@/models/types";

// Select
const user = await db.select().from(users).where(eq(users.id, userId));

// Insert
await db.insert(users).values({
  id: authUserId, // From Supabase Auth
  email: "user@example.com",
  fullName: "John Doe",
});

// Update
await db
  .update(users)
  .set({ fullName: "Jane Doe" })
  .where(eq(users.id, userId));
```

### Relationships & Joins

```typescript
// Product with seller info
const productWithSeller = await db
  .select()
  .from(products)
  .leftJoin(users, eq(products.sellerId, users.id))
  .where(eq(products.id, productId));

// User bids
const userBids = await db
  .select()
  .from(bids)
  .leftJoin(products, eq(bids.productId, products.id))
  .where(eq(bids.userId, userId));
```

### Shared Types Integration

```typescript
import { ApiResponse, ProductSearchFilters } from "@repo/shared-types";

// API responses use shared types
const response: ApiResponse<User[]> = {
  success: true,
  data: users,
  message: "Users retrieved successfully",
};
```

## Quick Reference

### Table Schema Pattern

```typescript
export const tableName = pgTable(
  "table_name",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    // ... other columns
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => [
    // Essential indexes only
    index("idx_table_field").on(table.field),
    // Business constraints
    check("constraint_name", sql`${table.field} > 0`),
  ]
);
```

### Key Features

- **Supabase Auth Integration**: Users table optimized for `auth.users.id` mapping
- **Minimal Indexes**: Only essential indexes for search performance
- **Shared Types**: Common types moved to `@repo/shared-types` package
- **Type Safety**: Full TypeScript support with Drizzle ORM
- **Business Constraints**: Database-level validation rules

### Model Checklist

- [ ] Snake_case table/column names
- [ ] UUID primary keys
- [ ] Proper foreign key references
- [ ] Essential indexes only
- [ ] Timestamp fields (createdAt, updatedAt)
- [ ] TypeScript type exports
- [ ] Business constraint checks

### Performance Notes

- ✅ **9 essential indexes** (reduced from 70+)
- ✅ **Search-focused**: Full-text + trigram indexes for products
- ✅ **Constraint validation**: Database-level business rules
- ✅ **Relationship integrity**: Proper cascade behaviors
