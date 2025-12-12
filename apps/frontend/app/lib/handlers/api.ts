import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

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

// Request interceptor - no longer needed to manually attach auth token
// Token is now stored in httpOnly cookies and automatically sent by the browser
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

    // Handle 401 - try refresh token
    if (
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

// Helper to check if user is authenticated
// We cannot check localStorage anymore since token is in httpOnly cookie
// Token existence is determined by successful API responses and browser's cookie management
export function isAuthenticated(): boolean {
  // This function is now mainly for checking if user state exists in the app
  // The actual token validation happens at the API level via httpOnly cookies
  // For critical checks, verify via an API endpoint
  return true; // Will be validated at API level
}

// Helper to get current user from localStorage
// USER_DATA is still stored in localStorage for UI purposes only (non-sensitive)
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Helper to clear auth data
// Only clear user data from localStorage, token is cleared by clearing httpOnly cookies
export function clearAuth() {
  // AccessToken is in httpOnly cookie - it's cleared by the backend via /auth/logout
  // Only clear user data from localStorage
  localStorage.removeItem("user");
}
