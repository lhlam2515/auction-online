# Action & Error Handlers

Type-safe handlers for React Router with validation, error handling, and API client.

## 📚 Table of Contents

- [Quick Start](#-quick-start)
- [Action Handler](#-action-handler)
  - [With Validation](#with-validation)
  - [Without Validation](#without-validation)
  - [API Reference](#api-reference)
- [Error Handler](#-error-handler)
  - [Basic Usage](#basic-usage)
  - [Functions](#functions)
  - [Supported Error Types](#supported-error-types)
- [API Client](#-api-client)
  - [Making Requests](#making-requests)
  - [Helper Functions](#helper-functions)
- [Complete Example](#-complete-example)

---

## 🚀 Quick Start

```ts
import {
  createAction,
  createSimpleAction,
  handleError,
  showError,
  apiClient,
} from "@/lib/handlers";
```

**Features:**

- ✅ Zod validation
- ✅ Auto toast notifications
- ✅ Field-level error reporting
- ✅ Axios/API error support
- ✅ Type-safe

---

## 🎯 Action Handler

### With Validation

```ts
import { createAction } from "@/lib/handlers";
import { loginSchema } from "@/lib/validation";

export const action = createAction(
  loginSchema,
  async (data) => {
    const response = await apiClient.post("/auth/login", data);
    return redirect("/dashboard");
  },
  { successMessage: "Đăng nhập thành công" }
);
```

### Without Validation

```ts
import { createSimpleAction } from "@/lib/handlers";

export const action = createSimpleAction(async () => {
  await apiClient.post("/auth/logout");
  return redirect("/login");
});
```

### API Reference

#### `createAction(schema, handler, options?)`

- `schema`: Zod schema
- `handler`: `async (data, args) => result`
- `options`: `{ successMessage?, actionName? }`

#### `createSimpleAction(handler, options?)`

- `handler`: `async (args) => result`
- `options`: `{ successMessage?, actionName? }`

---

## ❗ Error Handler

### Basic Usage

```ts
import { handleError, showError, getErrorDetails } from "@/lib/handlers";

// Full error handling (log + toast)
try {
  await apiClient.get("/users");
} catch (error) {
  handleError(error, { operation: "fetchUsers" });
}

// Just show toast
showError(error, "Có lỗi xảy ra");

// Get error details only
const details = getErrorDetails(error);
console.log(details.message, details.fieldErrors);
```

### Functions

| Function                                 | Description      | Returns        |
| ---------------------------------------- | ---------------- | -------------- |
| `handleError(error, context?, message?)` | Log + show toast | `ErrorDetails` |
| `showError(error, message?)`             | Show toast only  | `void`         |
| `getErrorDetails(error)`                 | Extract details  | `ErrorDetails` |
| `getErrorMessage(error, fallback?)`      | Get message      | `string`       |

### Supported Error Types

- **ZodError** → Field-level validation errors
- **AxiosError** → API response errors
- **ApiError** → Custom API errors
- **Error** → Standard JS errors
- **Unknown** → Fallback handling

---

## 🌐 API Client

Pre-configured Axios with auto auth, token refresh, and error handling.

### Making Requests

```ts
import { apiClient } from "@/lib/handlers";

// GET
const users = await apiClient.get("/users");

// POST
const user = await apiClient.post("/users", { name: "John" });

// With error handling
try {
  const data = await apiClient.get("/products");
} catch (error) {
  handleError(error);
}
```

### Helper Functions

```ts
// Check authentication
if (!isAuthenticated()) redirect("/login");

// Get current user
const user = getCurrentUser();

// Extract API error message
const message = getApiErrorMessage(error);
```

---

## 🔄 Complete Example

```ts
import {
  createAction,
  apiClient,
  handleError,
  isAuthenticated,
} from "@/lib/handlers";
import { loginSchema } from "@/lib/validation";

// Protected action
if (!isAuthenticated()) throw redirect("/login");

export const action = createAction(
  loginSchema,
  async (data) => {
    try {
      const response = await apiClient.post("/auth/login", data);
      localStorage.setItem("accessToken", response.data.token);
      return redirect("/dashboard");
    } catch (error) {
      throw error; // Handled by createAction
    }
  },
  { successMessage: "Đăng nhập thành công" }
);
```
