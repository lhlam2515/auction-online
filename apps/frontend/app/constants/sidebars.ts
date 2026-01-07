import type { UserRole } from "@repo/shared-types";
import type { LucideIcon } from "lucide-react";
import {
  Gavel,
  Heart,
  LayoutDashboard,
  TrendingUp,
  User,
  Package,
  PlusSquare,
  ClipboardList,
  ChartColumn,
  Users,
  ShieldCheck,
  Tags,
  Settings,
} from "lucide-react";

import { ACCOUNT_ROUTES, ADMIN_ROUTES, SELLER_ROUTES } from "./routes";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
  /** Optional: requires active seller status */
  requireActiveSeller?: boolean;
  /** Optional: section grouping */
  section: "account" | "seller" | "admin";
  /** Optional: alternative title for specific user contexts */
  alternativeTitle?: {
    /** When to show the alternative title */
    condition: "expiredSeller" | "activeSeller";
    /** Alternative text to display */
    text: string;
  };
}

/**
 * All menu items with role-based visibility
 * Each item specifies which roles can see it
 */
export const SIDEBAR_ITEMS: MenuItem[] = [
  // Account Section (BIDDER & SELLER)
  {
    title: "Tổng quan",
    url: ACCOUNT_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["BIDDER", "SELLER"],
    section: "account",
  },
  {
    title: "Hồ sơ cá nhân",
    url: ACCOUNT_ROUTES.PROFILE,
    icon: User,
    roles: ["BIDDER", "SELLER"],
    section: "account",
  },
  {
    title: "Lịch sử đấu giá",
    url: ACCOUNT_ROUTES.BIDS,
    icon: Gavel,
    roles: ["BIDDER", "SELLER"],
    section: "account",
  },
  {
    title: "Danh sách theo dõi",
    url: ACCOUNT_ROUTES.WATCHLIST,
    icon: Heart,
    roles: ["BIDDER", "SELLER"],
    section: "account",
  },
  {
    title: "Nâng cấp tài khoản",
    url: ACCOUNT_ROUTES.UPGRADE,
    icon: TrendingUp,
    roles: ["BIDDER", "SELLER"], // BIDDER upgrades, SELLER renews
    section: "account",
    alternativeTitle: {
      condition: "expiredSeller",
      text: "Gia hạn quyền bán",
    },
  },

  // Seller Section (SELLER only)
  {
    title: "Thống kê bán hàng",
    url: SELLER_ROUTES.DASHBOARD,
    icon: ChartColumn,
    roles: ["SELLER"],
    section: "seller",
  },
  {
    title: "Sản phẩm của tôi",
    url: SELLER_ROUTES.PRODUCTS,
    icon: Package,
    roles: ["SELLER"],
    section: "seller",
  },
  {
    title: "Tạo sản phẩm",
    url: SELLER_ROUTES.PRODUCT_CREATE,
    icon: PlusSquare,
    roles: ["SELLER"],
    requireActiveSeller: true, // Only active sellers can create
    section: "seller",
  },
  {
    title: "Đơn hàng bán",
    url: SELLER_ROUTES.ORDERS,
    icon: ClipboardList,
    roles: ["SELLER"],
    section: "seller",
  },

  // Admin Section (ADMIN only)
  {
    title: "Tổng quan hệ thống",
    url: ADMIN_ROUTES.DASHBOARD,
    icon: ChartColumn,
    roles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "Quản lý người dùng",
    url: ADMIN_ROUTES.USERS,
    icon: Users,
    roles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "Quản lý sản phẩm",
    url: ADMIN_ROUTES.PRODUCTS,
    icon: Package,
    roles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "Quản lý danh mục",
    url: ADMIN_ROUTES.CATEGORIES,
    icon: Tags,
    roles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "Yêu cầu nâng cấp",
    url: ADMIN_ROUTES.UPGRADES,
    icon: ShieldCheck,
    roles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "Cài đặt hệ thống",
    url: ADMIN_ROUTES.SETTINGS,
    icon: Settings,
    roles: ["ADMIN"],
    section: "admin",
  },
];

/**
 * Section headers for visual grouping
 */
export const SIDEBAR_SECTIONS = {
  account: "Tài khoản",
  seller: "Người bán",
  admin: "Quản trị",
} as const;

/**
 * Get menu items for specific role
 * Useful for server-side filtering or debugging
 */
export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return SIDEBAR_ITEMS.filter((item) => item.roles.includes(role));
}

/**
 * Get unique sections visible to a role
 */
export function getVisibleSections(role: UserRole): string[] {
  const items = getMenuItemsForRole(role);
  return [...new Set(items.map((item) => item.section))];
}
