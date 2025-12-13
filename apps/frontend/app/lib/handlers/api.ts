import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { STORAGE_KEYS } from "@/constants/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Extend AxiosRequestConfig to include _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // Enable credentials to automatically send/receive httpOnly cookies
  // This ensures the accessToken stored in httpOnly cookies is sent with every request
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors & refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const isAuthenticated = !!localStorage.getItem(STORAGE_KEYS.USER);

    // Handle 401 - try refresh token
    if (
      isAuthenticated &&
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Token is automatically sent via httpOnly cookies
        // Calling refresh endpoint to get new accessToken in httpOnly cookie
        await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Retry original request - accessToken is now in the httpOnly cookie
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        // SECURITY: No need to clear localStorage as we're not using it anymore
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
