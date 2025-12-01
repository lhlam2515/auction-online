/**
 * URL Utility Functions
 *
 * Helper functions for building and manipulating URLs in a consistent way
 */

/**
 * Build a URL with path segments
 *
 * @param baseUrl - Base URL
 * @param paths - Path segments to append
 * @returns Complete URL with paths
 *
 * @example
 * buildUrl("https://api.example.com", "users", "123")
 * // => "https://api.example.com/users/123"
 */
export function buildUrl(
  baseUrl: string,
  ...paths: (string | number)[]
): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPaths = paths
    .map((p) => String(p).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);

  if (cleanPaths.length === 0) return cleanBase;

  return `${cleanBase}/${cleanPaths.join("/")}`;
}

/**
 * Build query string from object
 * Filters out undefined and null values
 *
 * @param params - Object with query parameters
 * @returns URLSearchParams instance
 *
 * @example
 * buildQueryParams({ page: 1, limit: 10, filter: undefined })
 * // => URLSearchParams with "page=1&limit=10"
 */
export function buildQueryParams(
  params?: Record<string, string | number | boolean | undefined | null>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

/**
 * Build complete URL with path and query parameters
 *
 * @param baseUrl - Base URL
 * @param paths - Path segments
 * @param params - Query parameters
 * @returns Complete URL with paths and query string
 *
 * @example
 * buildUrlWithParams(
 *   "https://api.example.com",
 *   ["users", "123"],
 *   { include: "profile", active: true }
 * )
 * // => "https://api.example.com/users/123?include=profile&active=true"
 */
export function buildUrlWithParams(
  baseUrl: string,
  paths: (string | number)[],
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const url = buildUrl(baseUrl, ...paths);
  const queryParams = buildQueryParams(params);
  const queryString = queryParams.toString();

  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Append query params to existing URL
 *
 * @param url - Existing URL (may already have query params)
 * @param params - Additional query parameters to append
 * @returns URL with appended query params
 *
 * @example
 * appendQueryParams(
 *   "https://api.example.com/users?page=1",
 *   { limit: 10 }
 * )
 * // => "https://api.example.com/users?page=1&limit=10"
 */
export function appendQueryParams(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params || Object.keys(params).length === 0) return url;

  const [baseUrl, existingQuery] = url.split("?");
  const existingParams = new URLSearchParams(existingQuery);
  const newParams = buildQueryParams(params);

  // Merge params (new params override existing ones)
  newParams.forEach((value, key) => {
    existingParams.set(key, value);
  });

  const queryString = existingParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Extract query parameters from URL
 *
 * @param url - URL string
 * @returns Object with query parameters
 *
 * @example
 * extractQueryParams("https://api.example.com/users?page=1&limit=10")
 * // => { page: "1", limit: "10" }
 */
export function extractQueryParams(url: string): Record<string, string> {
  const [, queryString] = url.split("?");
  if (!queryString) return {};

  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Validate URL format
 *
 * @param url - URL string to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get API base URL with fallback
 *
 * @returns API base URL from environment or localhost
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
}

/**
 * Build API endpoint URL
 * Convenience wrapper around buildUrl using API base URL
 *
 * @param paths - Path segments
 * @returns Complete API URL
 *
 * @example
 * buildApiUrl("users", "123")
 * // => "http://localhost:3000/api/users/123"
 */
export function buildApiUrl(...paths: (string | number)[]): string {
  return buildUrl(getApiBaseUrl(), ...paths);
}

/**
 * Build API endpoint URL with query params
 * Convenience wrapper around buildUrlWithParams using API base URL
 *
 * @param paths - Path segments
 * @param params - Query parameters
 * @returns Complete API URL with query string
 *
 * @example
 * buildApiUrlWithParams(
 *   ["users"],
 *   { active: true }
 * )
 * // => "http://localhost:3000/api/users?active=true"
 */
export function buildApiUrlWithParams(
  paths: (string | number)[],
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  return buildUrlWithParams(getApiBaseUrl(), paths, params);
}

/**
 * Create FormData from object
 * Helper for file uploads and multipart requests
 *
 * @param data - Object to convert to FormData
 * @returns FormData instance
 *
 * @example
 * createFormData({ name: "John", file: FileInstance })
 */
export function createFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, String(item)));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

/**
 * Encode file name for URL
 *
 * @param filename - File name to encode
 * @returns URL-safe filename
 */
export function encodeFilename(filename: string): string {
  return encodeURIComponent(filename);
}

/**
 * Build URL for file download with proper encoding
 *
 * @param baseUrl - Base download URL
 * @param filename - File name
 * @returns Complete download URL
 */
export function buildDownloadUrl(baseUrl: string, filename: string): string {
  const encodedFilename = encodeFilename(filename);
  return buildUrl(baseUrl, encodedFilename);
}

/**
 * Parse pagination params from query string
 *
 * @param url - URL with pagination params
 * @returns Parsed pagination object
 */
export function parsePaginationParams(url: string): {
  page?: number;
  limit?: number;
  offset?: number;
} {
  const params = extractQueryParams(url);

  return {
    page: params.page ? parseInt(params.page, 10) : undefined,
    limit: params.limit ? parseInt(params.limit, 10) : undefined,
    offset: params.offset ? parseInt(params.offset, 10) : undefined,
  };
}

/**
 * Build pagination query params
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Query params object
 */
export function buildPaginationParams(
  page?: number,
  limit?: number
): Record<string, number> {
  const params: Record<string, number> = {};

  if (page !== undefined && page > 0) params.page = page;
  if (limit !== undefined && limit > 0) params.limit = limit;

  return params;
}

/**
 * Calculate offset from page and limit
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Offset value (0-indexed)
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
