import { ApiError, type ApiResponse, type ErrorResponse } from "@/types/api";

// Base API URL - can be configured via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

// Check if response is an error response
function isErrorResponse(
  response: ApiResponse<unknown>
): response is ErrorResponse {
  return response.success === false;
}

// Main API client
async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, headers, ...restConfig } = config;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Make request
  const response = await fetch(url, {
    ...restConfig,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  // Parse JSON response
  const data: ApiResponse<T> = await response.json();

  // Handle error responses
  if (isErrorResponse(data)) {
    throw new ApiError(
      data.error.statusCode,
      data.error.code,
      data.error.message,
      data.error.details
    );
  }

  return data.data;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: "DELETE" }),
};

// Auth token utilities (for when auth is implemented)
export const authToken = {
  get: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  set: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  },

  remove: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  },
};

// Helper to add auth header to requests
export function withAuth(config: RequestConfig = {}): RequestConfig {
  const token = authToken.get();
  if (!token) return config;

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}
