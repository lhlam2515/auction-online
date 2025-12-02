import { toast } from "sonner";
import { ZodError } from "zod";
import { AxiosError } from "axios";
import { ApiError } from "@/types/api";
import logger from "@/lib/logger";

/**
 * Error response structure for consistent error handling
 */
export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Convert Zod validation errors to field errors
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (path) {
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }
  });

  return fieldErrors;
}

/**
 * Extract error details from various error types
 */
export function getErrorDetails(error: unknown): ErrorDetails {
  // Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = formatZodErrors(error);
    const firstError = Object.values(fieldErrors)[0]?.[0];

    return {
      message: firstError || "Dữ liệu không hợp lệ",
      code: "VALIDATION_ERROR",
      statusCode: 422,
      fieldErrors,
    };
  }

  // Axios/API errors from apiClient
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const responseData = error.response?.data;

    // Extract message from response
    const message =
      responseData?.error?.message ||
      responseData?.message ||
      error.message ||
      "Có lỗi xảy ra khi gọi API";

    // Extract code from response
    const code = responseData?.error?.code || responseData?.code || "API_ERROR";

    // Extract field errors if available
    const fieldErrors = responseData?.error?.details || responseData?.details;

    return {
      message,
      code,
      statusCode: status,
      fieldErrors:
        fieldErrors && typeof fieldErrors === "object"
          ? fieldErrors
          : undefined,
    };
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      fieldErrors: error.details as Record<string, string[]> | undefined,
    };
  }

  // Standard errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    };
  }

  // Unknown errors
  return {
    message: "Đã xảy ra lỗi không xác định",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  };
}

/**
 * Get user-friendly error message based on error type and status code
 */
export function getErrorMessage(
  error: unknown,
  customMessage?: string
): string {
  if (customMessage) return customMessage;

  const details = getErrorDetails(error);

  // Return API error message directly
  if (error instanceof ApiError) {
    const statusMessages: Record<number, string> = {
      400: "Yêu cầu không hợp lệ",
      401: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn",
      403: "Bạn không có quyền truy cập",
      404: "Không tìm thấy tài nguyên",
      409: "Dữ liệu xung đột",
      422: "Dữ liệu không hợp lệ",
      429: "Quá nhiều yêu cầu, vui lòng thử lại sau",
      500: "Lỗi máy chủ nội bộ",
      502: "Máy chủ tạm thời không khả dụng",
      503: "Dịch vụ tạm thời không khả dụng",
    };

    return statusMessages[details.statusCode!] || details.message;
  }

  return details.message;
}

/**
 * Display error notification to user
 */
export function showError(error: unknown, customMessage?: string): void {
  const details = getErrorDetails(error);
  const message = customMessage || getErrorMessage(error);

  // Log error in development
  if (import.meta.env.DEV) {
    logger.error("Error occurred", error, {
      code: details.code,
      statusCode: details.statusCode,
      fieldErrors: details.fieldErrors,
    });
  }

  // Show appropriate toast based on error type
  if (details.statusCode && details.statusCode >= 500) {
    toast.error("Lỗi máy chủ", { description: message });
  } else if (details.fieldErrors) {
    const firstFieldError = Object.entries(details.fieldErrors)[0];
    if (firstFieldError) {
      const [field, errors] = firstFieldError;
      toast.error(message, {
        description: `${field}: ${errors[0]}`,
      });
    } else {
      toast.error(message);
    }
  } else {
    toast.error(message);
  }
}

/**
 * Handle errors with structured logging and user notification
 * @param error - The error to handle
 * @param context - Additional context for logging
 * @param customMessage - Custom message to show to user
 * @returns Error details for programmatic handling
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>,
  customMessage?: string
): ErrorDetails {
  const details = getErrorDetails(error);

  // Log error with context
  if (import.meta.env.DEV) {
    logger.error("Error handled", error, {
      ...context,
      code: details.code,
      statusCode: details.statusCode,
    });
  }

  // Show error to user
  showError(error, customMessage);

  return details;
}
