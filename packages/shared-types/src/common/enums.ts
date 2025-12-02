/**
 * HTTP status codes commonly used
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Sort order options
 */
export type SortOrder = "asc" | "desc";

/**
 * Common status types
 */
export type Status = "active" | "inactive" | "pending" | "archived";
