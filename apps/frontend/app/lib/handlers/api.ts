import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { tokenManager } from "./token-manager";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Extend AxiosRequestConfig to include _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// PERFORMANCE: Prevent multiple simultaneous refresh token requests (race condition)
// When multiple requests fail with 401, we only want ONE refresh call
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Process all queued requests after refresh succeeds/fails
const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // Enable credentials to send/receive httpOnly cookies (for refreshToken)
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // SECURITY: Add accessToken from memory to Authorization header
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors & refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 1. Kiểm tra nếu không có response (lỗi mạng) hoặc không phải 401
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // 2. Tránh refresh token cho chính API login/logout
    if (
      originalRequest.url?.includes("/auth") &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      return Promise.reject(error);
    }

    // 3. Xử lý hàng chờ nếu đang refresh
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    // 4. Bắt đầu quá trình Refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<{
        success: boolean;
        data: { accessToken: string };
      }>(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });

      // Store new accessToken in memory
      if (response.data?.success && response.data.data?.accessToken) {
        tokenManager.setToken(response.data.data.accessToken);
      }

      processQueue(); // Success!
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError); // Fail tất cả các request đang chờ

      // Clear token on refresh failure
      tokenManager.clearToken();

      // Tùy biến: Chỉ redirect nếu không phải môi trường SSR
      if (typeof window !== "undefined") {
        // Có thể dispatch một logout action ở đây thay vì href
        window.location.href = "/login?message=session_expired";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
