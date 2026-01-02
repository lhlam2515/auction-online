import type { SellerStats } from "@repo/shared-types";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

import StatsCard from "@/components/common/cards/StatsCard";
import { cn, formatPrice } from "@/lib/utils";

interface SellerStatsCardsProps {
  stats: SellerStats;
  className?: string;
}

const SellerStatsCards = ({ stats, className }: SellerStatsCardsProps) => {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2 xl:grid-cols-4", className)}>
      <StatsCard
        title="Đang đấu giá"
        value={stats.totalActiveProducts}
        icon={<Package className="h-5 w-5" />}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
        description="Sản phẩm đang được đấu giá"
      />
      <StatsCard
        title="Đã bán thành công"
        value={stats.totalSoldProducts}
        icon={<ShoppingCart className="h-5 w-5" />}
        iconColor="text-green-600"
        bgColor="bg-green-50"
        description="Đơn hàng đã hoàn tất"
      />
      <StatsCard
        title="Tổng doanh thu"
        value={formatPrice(parseInt(stats.totalRevenue, 10))}
        icon={<DollarSign className="h-5 w-5" />}
        iconColor="text-purple-600"
        bgColor="bg-purple-50"
        description="Thực nhận sau phí"
      />
      <StatsCard
        title="Tỷ lệ thành công"
        value={`${Math.round(stats.successRate * 100)}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        iconColor="text-orange-600"
        bgColor="bg-orange-50"
        description="Hiệu suất bán hàng"
      />
    </div>
  );
};

export default SellerStatsCards;
