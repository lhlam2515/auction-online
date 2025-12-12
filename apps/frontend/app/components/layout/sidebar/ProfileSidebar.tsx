import { Gavel, Heart, LayoutDashboard, TrendingUp, User } from "lucide-react";

import { ACCOUNT_SIDEBAR_ITEMS } from "@/constants/sidebars";

import Sidebar from "./Sidebar";

const iconMap = {
  "Tổng quan": LayoutDashboard,
  "Hồ sơ cá nhân": User,
  "Lịch sử đấu giá": Gavel,
  "Danh sách theo dõi": Heart,
  "Nâng cấp tài khoản": TrendingUp,
} as const;

const ProfileSidebar = () => {
  const items = ACCOUNT_SIDEBAR_ITEMS.map((it) => ({
    ...it,
    icon: iconMap[it.title as keyof typeof iconMap],
  }));

  return <Sidebar title="Tài khoản của tôi" items={items} className="w-64" />;
};

export default ProfileSidebar;
