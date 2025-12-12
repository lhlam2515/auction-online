import { Outlet } from "react-router";

import { AdminSidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout() {
  return (
    <ProtectedRoute requiredRole={["ADMIN"]}>
      <div className="sidebar-layout">
        <AdminSidebar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
