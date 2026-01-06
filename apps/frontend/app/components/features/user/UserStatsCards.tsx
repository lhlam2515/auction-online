import type { UserStats } from "@repo/shared-types";
import { ShoppingCart, DollarSign, TrendingUp, Activity } from "lucide-react";

import StatsCard from "@/components/common/cards/StatsCard";
import { cn, formatPrice } from "@/lib/utils";

interface UserStatsCardsProps {
  stats: UserStats;
  className?: string;
}

const UserStatsCards = ({ stats, className }: UserStatsCardsProps) => {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2 xl:grid-cols-4", className)}>
      <StatsCard
        title="Tổng thanh toán"
        value={formatPrice(stats.totalSpent)}
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
        description="Tổng chi tiêu của các sản phẩm thành công"
      />
      <StatsCard
        title="Đấu giá đang hoạt động"
        value={stats.activeBids}
        icon={<Activity className="h-5 w-5" />}
        iconColor="text-orange-600"
        bgColor="bg-orange-50"
        description="Các sản phẩm đang tham gia đấu giá"
      />
      <StatsCard
        title="Tổng sản phẩm tham gia"
        value={stats.totalBidsPlaced}
        icon={<ShoppingCart className="h-5 w-5" />}
        iconColor="text-green-600"
        bgColor="bg-green-50"
        description="Các sản phẩm đã tham gia đấu giá"
      />
      <StatsCard
        title="Tổng đấu giá thành công"
        value={stats.totalAuctionsWon}
        icon={<TrendingUp className="h-5 w-5" />}
        iconColor="text-purple-600"
        bgColor="bg-purple-50"
        description="Các sản phẩm đấu giá thành công"
      />
    </div>
  );
};

export default UserStatsCards;
