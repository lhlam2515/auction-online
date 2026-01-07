import type { AdminStats } from "@repo/shared-types";
import { Users, Gavel, UserPlus, DollarSign } from "lucide-react";

import { StatsCard } from "@/components/common/cards";
import { cn, formatPrice } from "@/lib/utils";

interface AdminStatsCardsProps {
  stats: AdminStats;
  className?: string;
}

/**
 * Component: AdminStatsCards
 * Displays admin dashboard statistics with 4 cards:
 * - Total Users
 * - Active Auctions
 * - Pending Upgrade Requests
 * - Total Transaction Value (GMV)
 */
const AdminStatsCards = ({ stats, className }: AdminStatsCardsProps) => {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2 xl:grid-cols-4", className)}>
      <StatsCard
        title="Tổng người dùng"
        value={stats.totalUsers.toLocaleString()}
        icon={<Users className="h-5 w-5" />}
        iconColor="text-blue-600"
        bgColor="bg-blue-500/10"
        description="Người dùng đã đăng ký"
      />
      <StatsCard
        title="Đấu giá đang hoạt động"
        value={stats.totalActiveAuctions.toLocaleString()}
        icon={<Gavel className="h-5 w-5" />}
        iconColor="text-emerald-600"
        bgColor="bg-emerald-500/10"
        description="Phiên đấu giá đang diễn ra"
      />
      <StatsCard
        title="Yêu cầu nâng cấp"
        value={stats.totalPendingUpgrades.toLocaleString()}
        icon={<UserPlus className="h-5 w-5" />}
        iconColor="text-amber-600"
        bgColor="bg-amber-500/10"
        description="Đang chờ xử lý"
      />
      <StatsCard
        title="Giá trị giao dịch"
        value={formatPrice(stats.totalTransactionValue)}
        icon={<DollarSign className="h-5 w-5" />}
        iconColor="text-primary"
        bgColor="bg-primary/10"
        description="Tổng GMV từ đơn hàng hoàn tất"
      />
    </div>
  );
};

export default AdminStatsCards;
