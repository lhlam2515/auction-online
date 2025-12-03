import { Outlet } from "react-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AccountLayout() {
  return (
    <ProtectedRoute>
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </ProtectedRoute>
  );
}
