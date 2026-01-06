import {
  Users,
  Package,
  Grid,
  ChartColumn,
  FolderTree,
  Settings,
} from "lucide-react";

import { ADMIN_SIDEBAR_ITEMS } from "@/constants/sidebars";

import Sidebar from "./Sidebar";

const iconMap = {
  "Thống kê": ChartColumn,
  "Người dùng": Users,
  "Sản phẩm": Package,
  "Danh mục": FolderTree,
  "Yêu cầu nâng cấp": Grid,
  "Cài đặt đấu giá": Settings,
} as const;

const AdminSidebar = () => {
  const items = ADMIN_SIDEBAR_ITEMS.map((it) => ({
    ...it,
    icon: iconMap[it.title as keyof typeof iconMap],
  }));

  return <Sidebar title="Quản trị" items={items} width="w-64" />;
};

export default AdminSidebar;
