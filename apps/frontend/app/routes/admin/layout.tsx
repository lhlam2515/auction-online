import { Outlet } from "react-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout() {
  return (
    <ProtectedRoute requiredRole={["ADMIN"]}>
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </ProtectedRoute>
  );
}
