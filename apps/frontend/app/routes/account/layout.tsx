import { Outlet } from "react-router";

import { ProfileSidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AccountLayout() {
  return (
    <ProtectedRoute>
      <div className="sidebar-layout">
        <ProfileSidebar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
