/**
 * Simple component to conditionally render content based on user role
 * Use this to show/hide UI elements without redirecting
 */

import type { UserRole } from "@repo/shared-types";
import type { ReactNode } from "react";

import { useAuth } from "@/contexts/auth-provider";
import { hasRole } from "@/lib/auth-utils";

interface RoleGuardProps {
  children: ReactNode;
  roles?: UserRole[];
  fallback?: ReactNode;
  requireAuth?: boolean;
}

/**
 * Conditionally render content based on user role
 *
 * @example
 * ```tsx
 * <RoleGuard roles={["ADMIN"]}>
 *   <AdminButton />
 * </RoleGuard>
 * ```
 *
 * @example
 * ```tsx
 * <RoleGuard roles={["ADMIN", "SELLER"]} fallback={<p>Access denied</p>}>
 *   <ManageButton />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  children,
  roles,
  fallback = null,
  requireAuth = true,
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !hasRole(user, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
