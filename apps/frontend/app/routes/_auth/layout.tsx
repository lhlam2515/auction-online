import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </div>
  );
}
