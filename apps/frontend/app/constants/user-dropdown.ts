import type { UserRole } from "@repo/shared-types";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  Gavel,
  Heart,
  TrendingUp,
  ChartColumn,
  Users,
  Package,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { ACCOUNT_ROUTES, SELLER_ROUTES, ADMIN_ROUTES } from "./routes";

export interface DropdownMenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
}

/**
 * Quick access menu items in user dropdown
 * Organized by frequency of use and role hierarchy
 */
export const USER_DROPDOWN_ITEMS: DropdownMenuItem[] = [
  // Account quick access (BIDDER & SELLER)
  {
    title: "Tổng quan",
    url: ACCOUNT_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["BIDDER", "SELLER"],
  },
  {
    title: "Hồ sơ cá nhân",
    url: ACCOUNT_ROUTES.PROFILE,
    icon: User,
    roles: ["BIDDER", "SELLER"],
  },
  {
    title: "Lịch sử đấu giá",
    url: ACCOUNT_ROUTES.BIDS,
    icon: Gavel,
    roles: ["BIDDER", "SELLER"],
  },
  {
    title: "Danh sách theo dõi",
    url: ACCOUNT_ROUTES.WATCHLIST,
    icon: Heart,
    roles: ["BIDDER", "SELLER"],
  },
  {
    title: "Nâng cấp tài khoản",
    url: ACCOUNT_ROUTES.UPGRADE,
    icon: TrendingUp,
    roles: ["BIDDER"], // Only show to bidders
  },

  // Seller dashboard quick link
  {
    title: "Thống kê bán hàng",
    url: SELLER_ROUTES.DASHBOARD,
    icon: ChartColumn,
    roles: ["SELLER"],
  },

  // Admin dashboard quick link
  {
    title: "Tổng quan hệ thống",
    url: ADMIN_ROUTES.DASHBOARD,
    icon: ChartColumn,
    roles: ["ADMIN"],
  },
  {
    title: "Quản lý người dùng",
    url: ADMIN_ROUTES.USERS,
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Quản lý sản phẩm",
    url: ADMIN_ROUTES.PRODUCTS,
    icon: Package,
    roles: ["ADMIN"],
  },
  {
    title: "Quản lý danh mục",
    url: ADMIN_ROUTES.CATEGORIES,
    icon: Tags,
    roles: ["ADMIN"],
  },
  {
    title: "Duyệt nâng cấp",
    url: ADMIN_ROUTES.UPGRADES,
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
];

/**
 * Get dropdown items for specific role
 */
export function getDropdownItemsForRole(role: UserRole): DropdownMenuItem[] {
  return USER_DROPDOWN_ITEMS.filter((item) => item.roles.includes(role));
}
