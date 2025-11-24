# Utils Directory

Thư mục này chứa các utility functions và helper modules được sử dụng chung trong toàn bộ ứng dụng.

## 📁 Cấu trúc

```text
utils/
├── errors.ts       # Custom error classes
├── response.ts     # API response helpers
├── validation.ts   # Validation utilities
├── crypto.ts       # Encryption/hashing utilities
├── date.ts         # Date manipulation helpers
├── string.ts       # String manipulation helpers
├── constants.ts    # Application constants
├── index.ts        # Export tất cả utilities
└── README.md       # File này
```

## 🎯 Mục đích

Utils chịu trách nhiệm:

- Reusable utility functions
- Common business logic helpers
- Data transformation utilities
- Custom error classes
- Response formatting helpers
- Validation functions
- Constants và enums

## 📝 Convention

### File naming

- Sử dụng **kebab-case** cho tên file
- Suffix: `.ts`
- Tên file theo chức năng: `crypto.ts`, `validation.ts`
- File `index.ts` để export utilities

### Function naming

```typescript
// ✅ Recommended naming
export const functionName = () => {
  // camelCase for functions
  // implementation
};

export class ClassName {
  // PascalCase for classes
  // methods
}

export const CONSTANT_NAME = "value"; // SCREAMING_SNAKE_CASE for constants
```

### Code structure

```typescript
// ✅ Recommended structure
// 1. Imports
import { ... } from '...';

// 2. Types và interfaces
interface HelperOptions {
  // options
}

// 3. Constants
const DEFAULT_OPTIONS: HelperOptions = {
  // defaults
};

// 4. Main functions
export const utilityFunction = (
  input: InputType,
  options: HelperOptions = DEFAULT_OPTIONS
): ReturnType => {
  // Implementation
  return result;
};

// 5. Helper functions (internal)
const internalHelper = (param: Type): Type => {
  // Helper implementation
};

// 6. Classes nếu cần
export class UtilityClass {
  // Class implementation
}
```

## 🚀 Cách sử dụng

### Import utilities

```typescript
// Import specific utilities
import { formatResponse } from "@/utils/response";
import { hashPassword } from "@/utils/crypto";

// Import all utilities
import * as Utils from "@/utils";

// Import class
import { AppError } from "@/utils/errors";
```

### Error utilities

```typescript
// errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

// Usage
throw new ValidationError("Invalid email format");
```

### Response utilities

```typescript
// response.ts
export class ResponseHandler {
  static sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string
  ): Response<SuccessResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString(),
    });
  }

  static sendError(/* parameters */): Response<ErrorResponse> {
    // Error response implementation
  }
}
```

## 📝 Common Utility Patterns

### Validation utilities

```typescript
// validation.ts
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
};
```

### Crypto utilities

```typescript
// crypto.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const generateSecureId = (): string => {
  return crypto.randomUUID();
};
```

### Date utilities

```typescript
// date.ts
export const formatDate = (
  date: Date,
  format: "short" | "long" = "short"
): string => {
  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "2-digit", day: "2-digit" };

  return date.toLocaleDateString("vi-VN", options);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (date: Date): boolean => {
  return date < new Date();
};

export const getTimeRemaining = (
  endDate: Date
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const total = endDate.getTime() - Date.now();

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
  };
};
```

### String utilities

```typescript
// string.ts
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncate = (
  text: string,
  maxLength: number,
  suffix: string = "..."
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const generateSlug = (title: string, id?: string): string => {
  const slug = slugify(title);
  return id ? `${slug}-${id.slice(-8)}` : slug;
};
```

### Constants

```typescript
// constants.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const USER_ROLES = {
  BIDDER: "BIDDER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;

export const AUCTION_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_MAX_LENGTH: 254,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;
```

## 🔧 Best Practices

### Pure functions

```typescript
// ✅ Pure function - same input always produces same output
export const calculateTax = (amount: number, rate: number): number => {
  return amount * rate;
};

// ❌ Impure function - depends on external state
let taxRate = 0.1;
export const calculateTaxBad = (amount: number): number => {
  return amount * taxRate; // Depends on external variable
};
```

### Error handling

```typescript
// ✅ Proper error handling with descriptive errors
export const parseJson = <T>(jsonString: string): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new AppError(`Invalid JSON format: ${error.message}`, 400);
  }
};
```

### Type safety

```typescript
// ✅ Type-safe utilities
export const pick = <T, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = object[key];
  });
  return result;
};

// Usage
const userProfile = pick(user, ["id", "email", "fullName"]);
```

### Configurable functions

```typescript
// ✅ Configurable với default options
interface FormatOptions {
  locale?: string;
  currency?: string;
  precision?: number;
}

export const formatCurrency = (
  amount: number,
  options: FormatOptions = {}
): string => {
  const { locale = "vi-VN", currency = "VND", precision = 0 } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(amount);
};
```

## 📋 Checklist khi tạo utility mới

- [ ] File name follow convention (kebab-case + .ts)
- [ ] Function names in camelCase
- [ ] Pure functions where possible
- [ ] Proper TypeScript typing
- [ ] JSDoc comments cho public functions
- [ ] Error handling với descriptive messages
- [ ] Unit tests cho utility functions
- [ ] Export từ index.ts
- [ ] Consider performance implications
- [ ] Handle edge cases appropriately

## 🎨 Example Template

````typescript
/**
 * [Description of utility purpose]
 */

// Imports
import { ... } from '...';

// Types
interface UtilityOptions {
  // Define options
}

// Constants
const DEFAULT_OPTIONS: UtilityOptions = {
  // Default values
};

/**
 * [Function description]
 * @param input - [Description]
 * @param options - [Description]
 * @returns [Description]
 * @example
 * ```typescript
 * const result = utilityFunction('input', { option: 'value' });
 * ```
 */
export const utilityFunction = (
  input: InputType,
  options: UtilityOptions = DEFAULT_OPTIONS
): ReturnType => {
  // Validation
  if (!input) {
    throw new AppError('Input is required', 400);
  }

  // Implementation
  const result = processInput(input, options);

  return result;
};

// Helper functions
const processInput = (input: InputType, options: UtilityOptions): ReturnType => {
  // Helper implementation
};
````

## 🧪 Testing utilities

```typescript
// __tests__/utils/crypto.test.ts
import { hashPassword, comparePassword } from "../crypto";

describe("Crypto utilities", () => {
  it("should hash password correctly", async () => {
    const password = "testpassword";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(await comparePassword(password, hash)).toBe(true);
  });
});
```
