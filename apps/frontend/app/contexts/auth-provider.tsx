import type { UserAuthData } from "@repo/shared-types";
import React, { createContext } from "react";

import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

interface AuthContextType {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserAuthData) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

// React 19: Render context directly without Context.Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<UserAuthData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await api.auth.me();
        if (result?.success && result.data?.user) {
          setUser(result.data.user);
          logger.info("Auth initialized from API", {
            userId: result.data.user.id,
          });
        }
      } catch {
        logger.info("Auth initialization failed - user not authenticated");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login user
  const login = React.useCallback((userData: UserAuthData) => {
    setUser(userData);
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
      logger.info("User logged out");
    }
  }, []);

  // Refresh access token via /auth/refresh-token
  const refreshUser = React.useCallback(async () => {
    try {
      const result = await api.auth.refreshToken();
      if (result?.success) {
        logger.info("Access token refreshed successfully");
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      logger.error("Failed to refresh user token", error);
      await logout();
    }
  }, [logout]);

  // Refetch user data from /auth/me
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
    login,
    logout,
    refreshUser,
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
