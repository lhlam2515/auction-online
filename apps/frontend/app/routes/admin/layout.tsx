import { Outlet } from "react-router";

import { Sidebar } from "@/components/layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Admin Layout
 * Protected routes for ADMIN role only
 * Manages administrative functions and user management
 */
export default function AdminLayout() {
  return (
    <ProtectedRoute requiredRole={["ADMIN"]}>
      <div className="sidebar-layout">
        <Sidebar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
