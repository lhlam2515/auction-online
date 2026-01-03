import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // 1. Auth Group (Layout wrapper)
  layout("routes/_auth/layout.tsx", [
    route("login", "routes/_auth/login/route.tsx"),
    route("register", "routes/_auth/register/route.tsx"),
    route("verify-email", "routes/_auth/verify-email/route.tsx"),
    route("forgot-password", "routes/_auth/forgot-password/route.tsx"),
    route("reset-password", "routes/_auth/reset-password/route.tsx"),
  ]),

  layout("routes/_root/layout.tsx", [
    // 2. Marketing / Public Group (Main Layout)
    index("routes/_root/route.tsx"), // Homepage
    route("search", "routes/_root/search/route.tsx"),
    route("products/:id", "routes/_root/products.$id/route.tsx"),
    route("not-found", "routes/_root/not-found/route.tsx"),
    route("unauthorized", "routes/_root/unauthorized/route.tsx"),

    // 3. Account Group (Layout Sidebar)
    route("account", "routes/account/layout.tsx", [
      route("dashboard", "routes/account/dashboard/route.tsx"),
      route("profile", "routes/account/profile/route.tsx"),
      route("bids", "routes/account/bids/route.tsx"),
      route("watchlist", "routes/account/watchlist/route.tsx"),
      route("upgrade", "routes/account/upgrade/route.tsx"),
      route("orders/:id", "routes/account/orders.$id/route.tsx"),
    ]),

    // 4. Seller Group (Layout Sidebar + Guard)
    route("seller", "routes/seller/layout.tsx", [
      route("dashboard", "routes/seller/dashboard/route.tsx"),
      route("products", "routes/seller/products/route.tsx"),
      route("products/create", "routes/seller/products.create/route.tsx"),
      route("products/:id", "routes/seller/products.$id/route.tsx"),
      route("orders", "routes/seller/orders/route.tsx"),
      route("orders/:id", "routes/seller/orders.$id/route.tsx"),
    ]),

    // 5. Admin Group (Layout Sidebar + Guard)
    route("admin", "routes/admin/layout.tsx", [
      route("dashboard", "routes/admin/dashboard/route.tsx"),
      route("categories", "routes/admin/categories/route.tsx"),
      route("users", "routes/admin/users/route.tsx"),
      route("products", "routes/admin/products/route.tsx"),
      route("upgrades", "routes/admin/upgrades/route.tsx"),
    ]),

    // 6. Catch-all 404 route (must be last)
    route("*", "routes/route.tsx"),
  ]),
] satisfies RouteConfig;
