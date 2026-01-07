/**
 * Application Routes Constants
 *
 * Centralized route definitions for the Online Auction System
 * Organized by user role: AUTH, APP, SELLER, ADMIN
 */

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
} as const;

// ==========================================
// APP ROUTES (Public & User Features)
// ==========================================

export const APP_ROUTES = {
  // Core pages
  HOME: "/",
  SEARCH: "/search",

  // Product pages
  PRODUCTS: "/products",
  PRODUCT: (id: string | number) => `/products/${id}`,

  // Profile page
  PROFILE: (id: string) => `/profile/${id}`,

  // Error pages
  NOT_FOUND: "/not-found",
  UNAUTHORIZED: "/unauthorized",

  // Help & Legal
  HELP: "/help",
  ABOUT: "/about",
  CONTACT: "/contact",
  TERMS_OF_SERVICE: "/terms",
  PRIVACY_POLICY: "/privacy",
} as const;

// ==========================================
// ACCOUNT ROUTES (User Dashboard & Profile)
// ==========================================

export const ACCOUNT_ROUTES = {
  DASHBOARD: "/account/dashboard",
  PROFILE: "/account/profile",
  WATCHLIST: "/account/watchlist",
  BIDS: "/account/bids",
  UPGRADE: "/account/upgrade",
  ORDER: (id: string | number) => `/account/orders/${id}`,
} as const;

// ==========================================
// SELLER ROUTES (Dashboard & Management)
// ==========================================

export const SELLER_ROUTES = {
  DASHBOARD: "/seller/dashboard",

  // Product management
  PRODUCTS: "/seller/products",
  PRODUCT_CREATE: "/seller/products/create",
  PRODUCT: (id: string | number) => `/seller/products/${id}`,

  // Order management
  ORDERS: "/seller/orders",
  ORDER: (id: string | number) => `/seller/orders/${id}`,
} as const;

// ==========================================
// ADMIN ROUTES
// ==========================================

export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",

  // User management
  USERS: "/admin/users",

  // Product management
  PRODUCTS: "/admin/products",

  // Category management
  CATEGORIES: "/admin/categories",

  // Upgrade requests
  UPGRADES: "/admin/upgrades",

  // Settings
  SETTINGS: "/admin/settings",
} as const;

// ==========================================
// ROUTE HELPERS
// ==========================================

/**
 * Check if a route is an authentication route
 */
export function isAuthRoute(pathname: string): boolean {
  return Object.values(AUTH_ROUTES).includes(pathname as AuthRoute);
}

/**
 * Check if a route is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/**
 * Check if a route is a seller route (requires seller role)
 */
export function isSellerRoute(pathname: string): boolean {
  return pathname.startsWith("/seller");
}

/**
 * Check if a route is an account route (user dashboard)
 */
export function isAccountRoute(pathname: string): boolean {
  return pathname.startsWith("/account");
}

/**
 * Check if a route is a public route (accessible without auth)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    APP_ROUTES.HOME,
    APP_ROUTES.SEARCH,
    APP_ROUTES.PRODUCTS,
    APP_ROUTES.HELP,
    APP_ROUTES.ABOUT,
    APP_ROUTES.CONTACT,
    APP_ROUTES.TERMS_OF_SERVICE,
    APP_ROUTES.PRIVACY_POLICY,
  ];

  return (
    isAuthRoute(pathname) ||
    publicPaths.some(
      (path) =>
        pathname === path ||
        (pathname.startsWith(path) && path !== APP_ROUTES.HOME)
    ) ||
    pathname.startsWith("/products/")
  );
}

/**
 * Get redirect path after login based on user role
 */
export function getRedirectAfterLogin(
  role: "ADMIN" | "SELLER" | "BIDDER"
): string {
  switch (role) {
    case "ADMIN":
      return ADMIN_ROUTES.DASHBOARD;
    case "SELLER":
      return SELLER_ROUTES.DASHBOARD;
    case "BIDDER":
    default:
      return APP_ROUTES.HOME;
  }
}

// ==========================================
// TYPE EXPORTS
// ==========================================

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
export type SellerRoute = (typeof SELLER_ROUTES)[keyof typeof SELLER_ROUTES];
export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
export type AccountRoute = (typeof ACCOUNT_ROUTES)[keyof typeof ACCOUNT_ROUTES];

export type AllRoutes =
  | AuthRoute
  | AppRoute
  | SellerRoute
  | AdminRoute
  | AccountRoute;
