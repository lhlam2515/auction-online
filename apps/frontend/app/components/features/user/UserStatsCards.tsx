import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { ShoppingCart, DollarSign } from "lucide-react";

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

interface UserStatsCardsProps {
  stats: OrderWithDetails[];
  autoBids: MyAutoBid[];
  className?: string;
}

const UserStatsCards = ({
  stats,
  autoBids,
  className,
}: UserStatsCardsProps) => {
  const orders = stats?.filter((item) => item.status === "COMPLETED");
  const totalAutoBis = autoBids.length;
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      <StatsCard
        title="Tổng thanh toán"
        value={formatPrice(
          orders.reduce(
            (total, item) => total + Number(item.finalPrice ?? 0),
            0
          ) || 0
        )}
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
        description="Tổng chi tiêu của các sản phẩm thành công"
      />
      <StatsCard
        title="Tổng sản phẩm đấu giá"
        value={totalAutoBis}
        icon={<ShoppingCart className="h-5 w-5" />}
        iconColor="text-green-600"
        bgColor="bg-green-50"
        description="Các sản phẩm đã và đang đấu giá"
      />
      <StatsCard
        title="Tổng đấu giá thành công"
        value={orders.length || "0"}
        icon={<DollarSign className="h-5 w-5" />}
        iconColor="text-purple-600"
        bgColor="bg-purple-50"
        description="Các sản phẩm đấu giá thành công"
      />
    </div>
  );
};

export default UserStatsCards;
