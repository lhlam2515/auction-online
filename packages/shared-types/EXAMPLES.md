# Usage Examples

## Basic Usage

### Import from Main Package

```typescript
import type {
  User,
  Product,
  ApiResponse,
  LoginRequest,
  LoginResponse,
} from "@repo/response-types";

// Use types
const handleLogin = async (credentials: LoginRequest): Promise<User> => {
  const response: ApiResponse<LoginResponse> = await api.post(
    "/auth/login",
    credentials
  );
  return response.data.user;
};
```

### Import from Specific Modules

```typescript
// Better for tree-shaking and more explicit
import type {
  User,
  UserRole,
  UpdateProfileRequest,
} from "@repo/response-types/user";
import type {
  Product,
  ProductStatus,
  CreateProductRequest,
} from "@repo/response-types/product";
import type {
  ApiResponse,
  PaginatedResponse,
} from "@repo/response-types/common";

// Define a function with specific types
const createProduct = async (
  data: CreateProductRequest
): Promise<ApiResponse<Product>> => {
  return await api.post("/products", data);
};

// Paginated response
const getProducts = async (): Promise<PaginatedResponse<Product>> => {
  const response = await api.get("/products");
  return response.data;
};
```

## Real-World Examples

### Frontend - React Component

```typescript
import { useState } from 'react';
import type { User, LoginRequest, ApiResponse, LoginResponse } from '@repo/response-types';

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleSubmit = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response: ApiResponse<LoginResponse> = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }).then(r => r.json());

      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.accessToken);
      }
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

### Backend - Express Route Handler

```typescript
import type { Request, Response } from "express";
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  User,
} from "@repo/response-types";

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<ApiResponse<LoginResponse>>
) => {
  const { email, password } = req.body;

  // Authenticate user
  const user: User = await authenticateUser(email, password);
  const accessToken = generateToken(user.id);

  const response: ApiResponse<LoginResponse> = {
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  };

  res.json(response);
};
```

### Backend - Service Layer

```typescript
import type {
  Product,
  CreateProductRequest,
  SearchProductsParams,
  PaginatedResponse,
} from "@repo/response-types";

class ProductService {
  async createProduct(
    data: CreateProductRequest,
    sellerId: string
  ): Promise<Product> {
    const product = await db.products.create({
      ...data,
      sellerId,
      status: "pending",
    });

    return this.mapToProduct(product);
  }

  async searchProducts(
    params: SearchProductsParams
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, q, categoryId, status } = params;

    const products = await db.products.findMany({
      where: {
        title: q ? { contains: q } : undefined,
        categoryId,
        status,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.products.count({
      where: {
        /* same conditions */
      },
    });

    return {
      items: products.map(this.mapToProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapToProduct(dbProduct: any): Product {
    // Map database model to API type
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      // ... other fields
    };
  }
}
```

### React Router Actions

```typescript
import type { ActionFunctionArgs } from "react-router";
import type {
  CreateProductRequest,
  ActionResponse,
  Product,
} from "@repo/response-types";

export const createProductAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const productData: CreateProductRequest = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    startingPrice: Number(formData.get("startingPrice")),
    stepPrice: Number(formData.get("stepPrice")),
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    autoExtend: formData.get("autoExtend") === "true",
    images: JSON.parse(formData.get("images") as string),
  };

  try {
    const response = await api.post<Product>("/products", productData);

    return {
      success: true,
      message: "Product created successfully",
      data: response.data,
    } satisfies ActionResponse<Product>;
  } catch (error) {
    return {
      success: false,
      error: "Failed to create product",
    } satisfies ActionResponse;
  }
};
```

### Type Guards

```typescript
import type { ApiResponse, ApiError } from "@repo/response-types";

export function isApiError(response: any): response is ApiError {
  return response.success === false && "message" in response;
}

export function isSuccessResponse<T>(
  response: ApiResponse<T> | ApiError
): response is ApiResponse<T> {
  return response.success === true;
}

// Usage
const response = await api.get("/products/123");

if (isSuccessResponse(response)) {
  console.log(response.data); // TypeScript knows this is Product
} else {
  console.error(response.message); // TypeScript knows this is ApiError
}
```

### Custom Hooks with Types

```typescript
import { useState, useEffect } from "react";
import type {
  Product,
  ApiResponse,
  PaginatedResponse,
} from "@repo/response-types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response: ApiResponse<PaginatedResponse<Product>> =
          await api.get("/products");

        setProducts(response.data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
```

## Advanced Patterns

### Generic API Client

```typescript
import type { ApiResponse, PaginatedResponse } from "@repo/response-types";

class ApiClient {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(url);
    return response.json();
  }

  async post<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getPaginated<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const queryString = new URLSearchParams(params).toString();
    const response: ApiResponse<PaginatedResponse<T>> = await this.get(
      `${url}?${queryString}`
    );
    return response.data;
  }
}

// Usage
const api = new ApiClient();
const products = await api.getPaginated<Product>("/products", {
  page: 1,
  limit: 10,
});
```

### Zod Schema Validation with Types

```typescript
import { z } from "zod";
import type { CreateProductRequest } from "@repo/response-types";

// Define Zod schema that matches the type
const createProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  categoryId: z.string().uuid(),
  startingPrice: z.number().positive(),
  stepPrice: z.number().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  autoExtend: z.boolean(),
  images: z.array(z.string().url()),
}) satisfies z.ZodType<CreateProductRequest>;

// Use in validation
export const validateProductData = (data: unknown): CreateProductRequest => {
  return createProductSchema.parse(data);
};
```

## Tips & Best Practices

1. **Use Type Imports**: Always use `import type` to ensure types are removed at runtime
2. **Specific Imports**: Import from specific modules when you only need a few types
3. **Type Guards**: Create type guards for runtime type checking
4. **Generics**: Use generic types like `ApiResponse<T>` for flexible API responses
5. **Satisfies**: Use `satisfies` for type checking while preserving literal types
6. **Documentation**: Add JSDoc comments when extending types for your specific use case
