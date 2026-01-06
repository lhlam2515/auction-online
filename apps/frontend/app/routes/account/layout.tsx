import { Outlet } from "react-router";

import { ProfileSidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ADMIN_ROUTES } from "@/constants/routes";

/**
 * Account Layout
 * Protected routes for BIDDER and SELLER only
 * ADMIN users are excluded as they use admin-specific features
 */
export default function AccountLayout() {
  return (
    <ProtectedRoute
      requiredRole={["BIDDER", "SELLER"]}
      redirectTo={ADMIN_ROUTES.DASHBOARD}
    >
      <div className="sidebar-layout">
        <ProfileSidebar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
