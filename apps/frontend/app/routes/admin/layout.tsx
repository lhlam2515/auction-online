import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </div>
  );
}
