# Validations Directory

Thư mục này chứa các Zod schema definitions cho request validation và data parsing.

## 📁 Cấu trúc

```text
validations/
├── index.ts            # Export tất cả validations
├── common.ts           # Common validation schemas
├── auth.validation.ts  # Authentication validation
├── user.validation.ts  # User-related validation
├── product.validation.ts # Product validation
├── auction.validation.ts # Auction validation
├── bid.validation.ts   # Bidding validation
└── README.md          # File này
```

## 🎯 Mục đích

Validations chịu trách nhiệm:

- Input data validation với Zod
- Request body, query, params validation
- Data transformation và parsing
- Custom validation rules
- Error message localization
- Type-safe validation schemas

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.validation.ts`
- Tên file theo domain: `user.validation.ts`, `product.validation.ts`
- File `common.ts` cho shared validations
- File `index.ts` để export schemas

### Schema naming

```typescript
// ✅ Recommended naming
export const createUserSchema = z.object({
  // camelCase + Schema suffix
  // validation rules
});

export const updateUserSchema = z.object({
  // Action + Resource + Schema
  // validation rules
});

export const userQuerySchema = z.object({
  // Purpose + Resource + Schema
  // validation rules
});
```

### Code structure

```typescript
// ✅ Recommended structure
import { z } from "zod";

// 1. Import common validations
import { paginationSchema, idSchema } from "./common";

// 2. Define base schemas
const baseUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

// 3. Extend schemas cho different operations
export const createUserSchema = baseUserSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updateUserSchema = baseUserSchema.partial().extend({
  id: idSchema,
});

export const userQuerySchema = paginationSchema.extend({
  role: z.enum(["BIDDER", "SELLER", "ADMIN"]).optional(),
  search: z.string().optional(),
});

// 4. Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
```

## 🚀 Cách sử dụng

### Import schemas

```typescript
// Import specific schema
import { createUserSchema } from "@/validations/user.validation";

// Import all validations
import * as Validations from "@/validations";

// Import types
import type { CreateUserInput } from "@/validations/user.validation";
```

### Validation trong middlewares

```typescript
import { validateRequest } from "@/middlewares/error-handler";
import { createUserSchema } from "@/validations/user.validation";

// Validate request body
router.post(
  "/users",
  validateRequest(createUserSchema),
  UserController.createUser
);

// Validate query parameters
router.get(
  "/users",
  validateRequest(userQuerySchema, "query"),
  UserController.getUsers
);

// Validate route parameters
router.get(
  "/users/:id",
  validateRequest(idParamSchema, "params"),
  UserController.getUser
);
```

### Manual validation

```typescript
// Trong controller hoặc service
import { createUserSchema } from "@/validations/user.validation";

export const createUser = async (req: Request, res: Response) => {
  try {
    // Parse and validate
    const validatedData = createUserSchema.parse(req.body);

    // Use validated data
    const user = await userService.createUser(validatedData);

    return ResponseHandler.sendCreated(res, user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Invalid input data", error.issues);
    }
    throw error;
  }
};
```

## 📝 Common Validation Patterns

### Common schemas

```typescript
// common.ts
import { z } from "zod";

// Basic types
export const idSchema = z.string().uuid("Invalid ID format");
export const emailSchema = z.string().email("Invalid email format");
export const phoneSchema = z
  .string()
  .regex(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, "Invalid Vietnamese phone number");

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Search and filters
export const searchSchema = z.object({
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Date ranges
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["endDate"],
    }
  );
```

### User validation

```typescript
// user.validation.ts
import { z } from "zod";
import { idSchema, emailSchema, phoneSchema } from "./common";

// Base user schema
const baseUserSchema = z.object({
  email: emailSchema,
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Full name can only contain letters and spaces"),
  phone: phoneSchema.optional(),
  address: z.string().max(255, "Address too long").optional(),
});

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number and special character"
  );

// Create user
export const createUserSchema = baseUserSchema
  .extend({
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["BIDDER", "SELLER"]).default("BIDDER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Update user
export const updateUserSchema = baseUserSchema.partial().extend({
  id: idSchema,
});

// Change password
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });
```

### Product validation

```typescript
// product.validation.ts
import { z } from "zod";
import { idSchema } from "./common";

// Product schema
export const createProductSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long"),
  category: z.enum([
    "ELECTRONICS",
    "FASHION",
    "HOME",
    "BOOKS",
    "SPORTS",
    "OTHERS",
  ]),
  condition: z.enum(["NEW", "USED", "REFURBISHED"]),
  startingPrice: z
    .number()
    .positive("Starting price must be positive")
    .max(1000000000, "Starting price too high"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  tags: z
    .array(z.string().max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: idSchema,
});

// Product query
export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    category: z
      .enum(["ELECTRONICS", "FASHION", "HOME", "BOOKS", "SPORTS", "OTHERS"])
      .optional(),
    condition: z.enum(["NEW", "USED", "REFURBISHED"]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["price", "createdAt", "title"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Min price must be less than max price",
      path: ["maxPrice"],
    }
  );
```

### Auction validation

```typescript
// auction.validation.ts
import { z } from "zod";
import { idSchema } from "./common";

export const createAuctionSchema = z
  .object({
    productId: idSchema,
    auctionType: z.enum(["ENGLISH", "SEALED_BID"]),
    startTime: z.coerce
      .date()
      .min(new Date(), "Start time must be in the future"),
    endTime: z.coerce.date(),
    reservePrice: z
      .number()
      .min(0, "Reserve price cannot be negative")
      .optional(),
    buyNowPrice: z
      .number()
      .positive("Buy now price must be positive")
      .optional(),
    bidIncrement: z
      .number()
      .positive("Bid increment must be positive")
      .default(1000),
    autoExtend: z.boolean().default(false),
    extensionTime: z.number().min(0).max(60).default(5), // minutes
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      if (data.buyNowPrice && data.reservePrice) {
        return data.buyNowPrice >= data.reservePrice;
      }
      return true;
    },
    {
      message: "Buy now price must be greater than or equal to reserve price",
      path: ["buyNowPrice"],
    }
  );

export const bidSchema = z
  .object({
    auctionId: idSchema,
    amount: z.number().positive("Bid amount must be positive"),
  })
  .refine(async (data) => {
    // Custom async validation - check if bid is higher than current highest bid
    // This would be handled in the controller/service layer
    return true;
  });
```

## 🔧 Best Practices

### Custom validation messages

```typescript
// ✅ Descriptive error messages
export const userSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),
});
```

### Transformation

```typescript
// ✅ Transform data during validation
export const productSchema = z.object({
  title: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase()),
  price: z.coerce.number().transform((n) => Math.round(n * 100) / 100), // Round to 2 decimals
  tags: z
    .string()
    .transform((s) => s.split(",").map((tag) => tag.trim()))
    .optional(),
});
```

### Complex validations

```typescript
// ✅ Complex validation với refine
export const passwordChangeSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });
```

### Conditional validation

```typescript
// ✅ Conditional validation
export const shippingSchema = z
  .object({
    type: z.enum(["PICKUP", "DELIVERY"]),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "DELIVERY") {
        return data.address && data.city && data.postalCode;
      }
      return true;
    },
    {
      message: "Address details are required for delivery",
      path: ["address"],
    }
  );
```

## 📋 Checklist khi tạo validation mới

- [ ] File name follow convention (kebab-case + .validation.ts)
- [ ] Schema names follow convention (action + resource + Schema)
- [ ] Descriptive error messages
- [ ] Proper data transformation nếu cần
- [ ] Type exports với z.infer<>
- [ ] Complex validations với refine
- [ ] Performance considerations for async validations
- [ ] Export từ index.ts
- [ ] Unit tests cho validation logic
- [ ] Documentation với examples

## 🎨 Example Template

```typescript
import { z } from "zod";
import { idSchema, paginationSchema } from "./common";

/**
 * Base schema cho [resource]
 */
const baseResourceSchema = z.object({
  // Define base fields
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

/**
 * Schema cho tạo mới [resource]
 */
export const createResourceSchema = baseResourceSchema
  .extend({
    // Additional fields for creation
  })
  .refine(
    (data) => {
      // Custom validation logic
      return true;
    },
    {
      message: "Validation error message",
      path: ["fieldName"],
    }
  );

/**
 * Schema cho cập nhật [resource]
 */
export const updateResourceSchema = baseResourceSchema.partial().extend({
  id: idSchema,
});

/**
 * Schema cho query [resource]
 */
export const resourceQuerySchema = paginationSchema.extend({
  // Query parameters
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

/**
 * Schema cho route parameters
 */
export const resourceParamsSchema = z.object({
  id: idSchema,
});

// Type exports
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
```

## 🧪 Testing validations

```typescript
// __tests__/validations/user.test.ts
import { createUserSchema } from "../user.validation";

describe("User validation", () => {
  it("should validate correct user data", () => {
    const validData = {
      email: "test@example.com",
      fullName: "John Doe",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      email: "invalid-email",
      fullName: "John Doe",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```
