# Models Directory

Thư mục này chứa các Drizzle ORM schema definitions và database models.

## 📁 Cấu trúc

```text
models/
├── index.ts              # Export tất cả models
├── enums.model.ts        # Database enums
├── users.model.ts        # User-related tables
├── products.model.ts     # Product-related tables
├── auction.model.ts      # Auction-related tables
├── interactions.model.ts # User interactions
└── README.md            # File này
```

## 🎯 Mục đích

Models chịu trách nhiệm:

- Define database schema với Drizzle ORM
- Type definitions cho database entities
- Relationships giữa các tables
- Indexes và constraints
- Enums và custom types

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.model.ts`
- Tên file mô tả domain: `users.model.ts`, `products.model.ts`
- File `enums.model.ts` cho tất cả enums
- File `index.ts` để export tất cả

### Table naming

```typescript
// ✅ Recommended structure
export const tableName = pgTable("table_name", {
  // columns definition
});

// Table name: snake_case, plural form
// Variable name: camelCase, singular/plural tùy context
```

### Column naming

```typescript
// ✅ Good column definitions
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### Code structure

```typescript
// ✅ Recommended structure
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// 1. Import enums if needed
import { userRoleEnum } from "./enums.model";

// 2. Define table schema
export const users = pgTable("users", {
  // Primary key first
  id: uuid("id").primaryKey().defaultRandom(),

  // Required fields
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),

  // Optional fields
  address: text("address"),
  avatarUrl: text("avatar_url"),

  // Enums
  role: userRoleEnum("role").default("BIDDER"),

  // Timestamps last
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 3. Export type definitions
export type User = InferSelectModel<typeof users>;
export type CreateUser = InferInsertModel<typeof users>;
export type UpdateUser = Partial<CreateUser>;
```

## 🚀 Cách sử dụng

### Import models

```typescript
// Import specific table
import { users } from "@/models/users.model";

// Import all (recommended)
import * as models from "@/models";

// Import types
import { User, CreateUser } from "@/models/users.model";
```

### Database operations

```typescript
import { db } from "@/config/database";
import { users } from "@/models";

// Select
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, userId));

// Insert
const newUser = await db
  .insert(users)
  .values({
    email: "user@example.com",
    fullName: "John Doe",
  })
  .returning();

// Update
const updatedUser = await db
  .update(users)
  .set({ fullName: "Jane Doe" })
  .where(eq(users.id, userId))
  .returning();

// Delete
await db.delete(users).where(eq(users.id, userId));
```

### Relationships

```typescript
// One-to-many relationship
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => users.id), // Foreign key
  // other columns...
});

// Many-to-many với junction table
export const userFavorites = pgTable(
  "user_favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.productId), // Composite primary key
  })
);
```

### Enums definition

```typescript
// enums.model.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["BIDDER", "SELLER", "ADMIN"]);
export const auctionStatusEnum = pgEnum("auction_status", [
  "PENDING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
```

## 🔧 Best Practices

- **Type Safety**: Sử dụng TypeScript types được generate từ schema
- **Consistent Naming**: Follow naming convention across all models
- **Proper Constraints**: Add appropriate indexes, unique constraints
- **Relationships**: Define foreign keys và relationships properly
- **Timestamps**: Include `createdAt`, `updatedAt` cho audit trail
- **Soft Delete**: Consider soft delete với `isDeleted` flag
- **Documentation**: JSDoc comments cho complex relationships

## 📋 Checklist khi tạo model mới

- [ ] File name follow convention (kebab-case + .model.ts)
- [ ] Table name in snake_case, plural form
- [ ] Column names in snake_case
- [ ] Primary key definition (uuid recommended)
- [ ] Proper data types cho columns
- [ ] Foreign key references nếu cần
- [ ] Appropriate constraints (unique, not null)
- [ ] Default values for optional fields
- [ ] Timestamps (createdAt, updatedAt)
- [ ] Export TypeScript types (InferSelectModel, InferInsertModel)
- [ ] Update index.ts để export model
- [ ] Add JSDoc comments nếu cần

## 🎨 Example Template

```typescript
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Import enums
import { statusEnum } from "./enums.model";

// Import related tables for foreign keys
import { users } from "./users.model";

/**
 * Resource table definition
 * Represents [description of what this table stores]
 */
export const resources = pgTable("resources", {
  // Primary key
  id: uuid("id").primaryKey().defaultRandom(),

  // Required fields
  name: text("name").notNull(),
  description: text("description").notNull(),

  // Foreign keys
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),

  // Optional fields
  metadata: text("metadata"), // JSON string

  // Enums
  status: statusEnum("status").default("ACTIVE"),

  // Boolean flags
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type exports
export type Resource = InferSelectModel<typeof resources>;
export type CreateResource = InferInsertModel<typeof resources>;
export type UpdateResource = Partial<Omit<CreateResource, "id" | "createdAt">>;
```

## 🗄️ Database Schema Guidelines

### Column Types

- **IDs**: `uuid()` với `defaultRandom()`
- **Text**: `text()` cho strings
- **Numbers**: `integer()`, `real()`, `numeric()`
- **Dates**: `timestamp()` với `withTimezone: true`
- **Booleans**: `boolean()` với default values
- **Enums**: Custom `pgEnum()` definitions

### Indexes

```typescript
// Add indexes for performance
export const products = pgTable(
  "products",
  {
    // columns...
  },
  (table) => ({
    // Composite index
    sellerStatusIdx: index("seller_status_idx").on(
      table.sellerId,
      table.status
    ),
    // Single column index
    nameIdx: index("name_idx").on(table.name),
  })
);
```

### Constraints

```typescript
// Unique constraints
email: text("email").notNull().unique(),

// Check constraints (when supported)
price: numeric("price").notNull(), // Add check price > 0 in migration

// Foreign key with cascade
userId: uuid("user_id")
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
```
