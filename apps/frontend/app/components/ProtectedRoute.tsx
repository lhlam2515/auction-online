import type { UserRole } from "@repo/shared-types";
import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router";

import { AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  redirectTo?: string;
}

/**
 * Protected Route - handles authentication and role-based authorization
 *
 * @param requiredRole - Array of roles that can access this route
 * @param redirectTo - Custom redirect path when unauthorized (default: /unauthorized)
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}
