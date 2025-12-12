import { Package, PlusSquare, ClipboardList, ChartColumn } from "lucide-react";

import { SELLER_SIDEBAR_ITEMS } from "@/constants/sidebars";

import Sidebar from "./Sidebar";

const iconMap = {
  "Thống kê": ChartColumn,
  "Sản phẩm": Package,
  "Tạo sản phẩm": PlusSquare,
  "Đơn hàng": ClipboardList,
} as const;

const SellerSidebar = () => {
  const items = SELLER_SIDEBAR_ITEMS.map((it) => ({
    ...it,
    icon: iconMap[it.title as keyof typeof iconMap],
  }));

  return <Sidebar title="Người bán" items={items} width="w-64" />;
};

export default SellerSidebar;
