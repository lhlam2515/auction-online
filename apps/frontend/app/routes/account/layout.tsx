import { Outlet } from "react-router";

import { ProfileSidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AccountLayout() {
  return (
<<<<<<< HEAD
    // <ProtectedRoute>
    //   {/* Add Header/Sidebar specific to this layout */}

    // </ProtectedRoute>

    <Outlet />
=======
    <ProtectedRoute>
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </ProtectedRoute>
>>>>>>> 31691fe (feat(layout): add layout components including navigation and sidebars (#11))
  );
}
