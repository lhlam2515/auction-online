import type { UserAuthData } from "@repo/shared-types";
import React, { createContext } from "react";

import { STORAGE_KEYS } from "@/constants/api";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

interface AuthContextType {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserAuthData) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<UserAuthData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load user from localStorage on mount
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser) as UserAuthData;
        setUser(userData);
        logger.info("Auth initialized from localStorage", {
          userId: userData.id,
        });
      }
    } catch (error) {
      logger.error("Failed to load user from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login user
  const login = React.useCallback((userData: UserAuthData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
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
      localStorage.removeItem(STORAGE_KEYS.USER);
      logger.info("User logged out");
    }
  }, []);

  // Refetch user data from /auth/me (on demand)
  const refetchUser = React.useCallback(async () => {
    try {
      const result = await api.auth.me();
      if (result?.success && result.data?.user) {
        setUser(result.data.user);
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.data.user)
        );
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
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
