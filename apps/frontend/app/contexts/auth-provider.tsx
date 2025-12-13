import type { UserAuthData } from "@repo/shared-types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { STORAGE_KEYS } from "@/constants/api";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

interface AuthContextType {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: UserAuthData) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// React 19: Render context directly without Context.Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (accessToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          logger.info("Auth initialized from storage", {
            userId: parsedUser.id,
          });
        }
      } catch (error) {
        logger.error("Failed to initialize auth", error);
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler - stores token and user data
  const login = useCallback((accessToken: string, userData: UserAuthData) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
    logger.info("User logged in", { userId: userData.id });
  }, []);

  // Logout handler - clears all auth data
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await api.auth.logout();
    } catch (error) {
      logger.error("Logout API failed", error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      logger.info("User logged out");
    }
  }, []);

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    try {
      const result = await api.auth.refreshToken();
      if (result?.success && result.data) {
        const { accessToken } = result.data;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        logger.info("Access token refreshed successfully");
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      logger.error("Failed to refresh user token", error);
      // If refresh fails, logout the user
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  // React 19: Render context directly instead of AuthContext.Provider
  return <AuthContext value={value}>{children}</AuthContext>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
