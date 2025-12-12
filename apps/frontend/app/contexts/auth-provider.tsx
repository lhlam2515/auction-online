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
  login: (user: UserAuthData) => void;
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

  // Initialize auth state from localStorage (user data only)
  // Token is now in httpOnly cookies, not localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          logger.info("Auth initialized from storage", {
            userId: parsedUser.id,
          });
        }
      } catch (error) {
        logger.error("Failed to initialize auth", error);
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // login() no longer accepts accessToken parameter
  // Token is managed entirely by the browser via httpOnly cookies
  const login = useCallback((userData: UserAuthData) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
    logger.info("User logged in", { userId: userData.id });
  }, []);

  // Logout handler - clears user data and calls backend to clear httpOnly cookies
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint to clear httpOnly cookies
      await api.auth.logout();
    } catch (error) {
      logger.error("Logout API failed", error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage (user data only)
      // AccessToken is in httpOnly cookie - cleared by backend via /auth/logout
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      logger.info("User logged out");
    }
  }, []);

  // Refresh user data from backend
  // Token refresh is handled automatically by interceptors
  // This function is mainly for refreshing other user-related data if needed
  const refreshUser = useCallback(async () => {
    try {
      const result = await api.auth.refreshToken();
      if (result?.success) {
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
