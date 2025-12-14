import type { ApiResponse } from "@repo/shared-types";

/**
 * Re-export shared types for use across backend
 */
export type { ApiResponse };

/**
 * Backend-specific error response structure
 * Extends shared ApiResponse with additional backend fields
 */
export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Backend success response structure
 * Compatible with shared ApiResponse
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Backend-specific alias for ApiResponse
 * Used in response handlers
 */
export type BackendApiResponse<T = unknown> =
  | SuccessResponse<T>
  | ErrorResponse;

/**
 * Application error options
 * Used for creating custom error instances
 */
export interface AppErrorOptions {
  message: string;
  statusCode: number;
  code: string;
  details?: unknown;
  cause?: Error;
}

/**
 * Standard error codes used across the application
 */
export enum ErrorCodes {
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // System errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}
