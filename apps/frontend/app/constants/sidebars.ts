/**
 * Sidebar menu item definitions centralized for reuse across roles.
 * Keep icons out of the constant file to avoid coupling to UI libs —
 * components will map icons locally.
 */
import { ACCOUNT_ROUTES, ADMIN_ROUTES, SELLER_ROUTES } from "./routes";

export const ACCOUNT_SIDEBAR_ITEMS = [
  { title: "Tổng quan", url: ACCOUNT_ROUTES.DASHBOARD },
  { title: "Hồ sơ cá nhân", url: ACCOUNT_ROUTES.PROFILE },
  { title: "Lịch sử đấu giá", url: ACCOUNT_ROUTES.BIDS },
  { title: "Danh sách theo dõi", url: ACCOUNT_ROUTES.WATCHLIST },
  { title: "Nâng cấp tài khoản", url: ACCOUNT_ROUTES.UPGRADE },
];

export const ADMIN_SIDEBAR_ITEMS = [
  { title: "Thống kê", url: ADMIN_ROUTES.DASHBOARD },
  { title: "Người dùng", url: ADMIN_ROUTES.USERS },
  { title: "Sản phẩm", url: ADMIN_ROUTES.PRODUCTS },
  { title: "Danh mục", url: ADMIN_ROUTES.CATEGORIES },
  { title: "Yêu cầu nâng cấp", url: ADMIN_ROUTES.UPGRADES },
  { title: "Cài đặt đấu giá", url: ADMIN_ROUTES.SETTINGS },
];

export const SELLER_SIDEBAR_ITEMS = [
  { title: "Thống kê", url: SELLER_ROUTES.DASHBOARD },
  { title: "Sản phẩm", url: SELLER_ROUTES.PRODUCTS },
  { title: "Tạo sản phẩm", url: SELLER_ROUTES.PRODUCT_CREATE },
  { title: "Đơn hàng", url: SELLER_ROUTES.ORDERS },
];

export type SidebarItem = { title: string; url: string };

export default {};
