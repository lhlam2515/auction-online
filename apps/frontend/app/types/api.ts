import type { ApiResponse, PaginatedResponse } from "@repo/shared-types";

/**
 * Re-export shared types for use across frontend
 */
export type { ApiResponse, PaginatedResponse };

/**
 * API Error class for consistent error handling
 * Used throughout the frontend for error management
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}
