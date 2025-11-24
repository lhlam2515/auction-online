import { Outlet } from "react-router";

export default function AccountLayout() {
  return (
    <div className="account-layout">
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </div>
  );
}
