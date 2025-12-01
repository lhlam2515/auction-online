import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="root-layout">
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </div>
  );
}
