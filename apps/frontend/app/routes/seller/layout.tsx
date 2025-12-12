import { Outlet } from "react-router";

import { SellerSidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SellerLayout() {
  return (
    <ProtectedRoute requiredRole={["SELLER"]}>
      <div className="sidebar-layout">
        <SellerSidebar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
