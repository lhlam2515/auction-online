import { toast } from "sonner";
import { ApiError, type ApiResponse } from "@/types/api";

export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    const data: ApiResponse<T> = await response.json();

    if (!data.success || !response.ok) {
      throw new ApiError(
        data.error?.statusCode || response.status,
        data.error?.code || "UNKNOWN_ERROR",
        data.error?.message || `HTTP Error: ${response.status}`
      );
    }

    return data.data!;
  } catch (error) {
    // Re-throw if already ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
      );
    }

    // Unknown error
    throw new ApiError(
      500,
      "UNKNOWN_ERROR",
      error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
    );
  }
}

export function showError(error: unknown, customMessage?: string) {
  const message = getErrorMessage(error, customMessage);

  if (error instanceof ApiError && error.isClientError()) {
    toast.error(message);
  } else if (error instanceof ApiError && error.isServerError()) {
    toast.error("Lỗi máy chủ", { description: message });
  } else {
    toast.error(message);
  }
}

export function getErrorMessage(
  error: unknown,
  customMessage?: string
): string {
  if (customMessage) return customMessage;

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

    return statusMessages[error.statusCode] || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định";
}
