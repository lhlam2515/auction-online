import type { SellerStats } from "@repo/shared-types";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  description?: string; // Optional description like "+20% from last month"
}

const StatsCard = ({
  title,
  value,
  icon,
  iconColor,
  bgColor,
  description,
}: StatsCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <div
          className={cn("bg-opacity-10 rounded-full p-2.5", bgColor, iconColor)}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-card-foreground text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface SellerStatsCardsProps {
  stats: SellerStats;
  className?: string;
}

const SellerStatsCards = ({ stats, className }: SellerStatsCardsProps) => {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <StatsCard
        title="Đang đấu giá"
        value={stats.totalActiveProducts}
        icon={<Package className="h-5 w-5" />}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
        description="Sản phẩm đang active"
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
