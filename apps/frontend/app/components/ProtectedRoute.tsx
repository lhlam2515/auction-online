import type { UserRole } from "@repo/shared-types";
import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router";

import { AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  // Check role-based access
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
