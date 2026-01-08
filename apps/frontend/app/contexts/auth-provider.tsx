import type { UserAuthData } from "@repo/shared-types";
import React, { createContext } from "react";
import { useLocation } from "react-router";

import { isAuthRoute } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import { tokenManager } from "@/lib/handlers/token-manager";
import logger from "@/lib/logger";

interface AuthContextType {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  login: (user: UserAuthData, token: string) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const location = useLocation();
  const [user, setUser] = React.useState<UserAuthData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // SECURITY: Store accessToken in memory (React state) instead of localStorage
  // This prevents XSS attacks from stealing the token
  const [accessToken, setAccessToken] = React.useState<string | null>(null);

  const initializeAuth = React.useCallback(async () => {
    try {
      const result = await api.auth.me();
      if (result?.success && result.data?.user) {
        setUser(result.data.user);
        logger.info("Auth initialized from API", {
          userId: result.data.user.id,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      logger.error("Failed to initialize auth from API", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isAuthRoute(location.pathname)) {
      // Skip auth initialization on auth routes
      setIsLoading(false);
      return;
    }

    initializeAuth();
  }, [initializeAuth, location.pathname]);

  // Login user
  const login = React.useCallback((userData: UserAuthData, token: string) => {
    setUser(userData);
    setAccessToken(token);
    tokenManager.setToken(token);
    logger.info("User logged in", { userId: userData.id });
  }, []);

  // Logout user
  const logout = React.useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      logger.error("Logout API failed", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      tokenManager.clearToken();
      logger.info("User logged out");
    }
  }, []);

  // Refetch user data from /auth/me (on demand)
  const refetchUser = React.useCallback(async () => {
    try {
      const result = await api.auth.me();
      if (result?.success && result.data?.user) {
        setUser(result.data.user);
        logger.info("User data refetch", {
          userId: result.data.user.id,
        });
      }
    } catch (error) {
      logger.error("Failed to refetch user data", error);
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    accessToken,
    setAccessToken,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
// Custom hook to use auth context
export function useAuth() {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
