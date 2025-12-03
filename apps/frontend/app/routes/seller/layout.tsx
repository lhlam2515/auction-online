import { Outlet } from "react-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SellerLayout() {
  return (
    <ProtectedRoute requiredRole={["SELLER"]}>
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </ProtectedRoute>
  );
}
