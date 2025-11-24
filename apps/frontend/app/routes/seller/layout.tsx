import { Outlet } from "react-router";

export default function SellerLayout() {
  return (
    <div className="seller-layout">
      {/* Add Header/Sidebar specific to this layout */}
      <Outlet />
    </div>
  );
}
