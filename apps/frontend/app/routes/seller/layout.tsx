import { Outlet } from "react-router";

import { Sidebar } from "@/components/layout";
import { SellerExpirationBanner } from "@/components/SellerExpirationBanner";
import { SellerRoute } from "@/components/SellerRoute";

/**
 * Seller Layout
 * Protected routes for SELLER role only
 *
 * Access rules:
 * - Active sellers: Full access to all features
 * - Expired sellers with products: Can view and manage existing products/orders
 * - Expired sellers without products: Redirected to upgrade page
 *
 * Note: Creating new products requires active seller status
 */
export default function SellerLayout() {
  return (
    <SellerRoute>
      <div className="sidebar-layout">
        <Sidebar />
        <div className="container space-y-4">
          <SellerExpirationBanner />
          <Outlet />
        </div>
      </div>
    </SellerRoute>
  );
}
