import type {
  SellerStats,
  User,
  RatingSummary,
  RatingWithUsers,
  RevenueAnalytics,
} from "@repo/shared-types";
import { LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RevenueChart } from "@/components/features/analytics";
import {
  RatingSummaryCard,
  RatingHistoryList,
} from "@/components/features/interaction/rating";
import {
  SellerProfileHeader,
  SellerStatsCards,
} from "@/components/features/seller";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bảng Điều Khiển Người Bán - Online Auction" },
    {
      name: "description",
      content:
        "Trang bảng điều khiển người bán cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function SellerDashboardPage() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>();
  const [ratingHistory, setRatingHistory] = useState<RatingWithUsers[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!authUser?.id) return;

      try {
        setIsLoading(true);

        const [statsResult, userResult, summaryRes, historyRes, revenueRes] =
          await Promise.all([
            api.seller.getStats(),
            api.users.getProfile(),
            api.ratings.getSummary(authUser.id),
            api.ratings.getByUser(authUser.id, { page: 1, limit: 10 }),
            api.seller.getSellerRevenue("30d"),
          ]);

        if (statsResult?.success) setStats(statsResult.data);
        if (userResult?.success) setUser(userResult.data);

        if (summaryRes?.success && summaryRes.data) {
          setRatingSummary(summaryRes.data);
        }

        if (historyRes?.success && historyRes.data) {
          setRatingHistory(historyRes.data.items);
        }

        if (revenueRes?.success && revenueRes.data) {
          setRevenueData(revenueRes.data);
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard");
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [authUser?.id]);

  const handlePeriodChange = async (period: "7d" | "30d" | "12m") => {
    try {
      setIsLoadingChart(true);
      const response = await api.seller.getSellerRevenue(period);
      if (response?.success && response.data) {
        setRevenueData(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu biểu đồ");
      console.error("Failed to fetch revenue data:", error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <Spinner className="" />
        <span>Đang tải dữ liệu người bán...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Profile / Header Section */}
      <section>{user && <SellerProfileHeader user={user} />}</section>

      {/* 2. Stats Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            Tổng quan kinh doanh
          </h2>
        </div>
        {stats && <SellerStatsCards stats={stats} />}
      </section>

      {/* 3. Chart and Rating Summary Section */}
      <section className="grid gap-6 md:grid-cols-7">
        {/* Vùng này dành cho Biểu đồ doanh thu */}
        <div className="col-span-4">
          {revenueData && (
            <RevenueChart
              data={revenueData}
              onPeriodChange={handlePeriodChange}
              isLoading={isLoadingChart}
            />
          )}
        </div>

        {/* Vùng này dành cho Rating Summary */}
        <div className="col-span-3">
          {ratingSummary && <RatingSummaryCard summary={ratingSummary} />}
        </div>
      </section>

      {/* 4. Rating History Section */}
      <section>
        <RatingHistoryList ratings={ratingHistory} isLoading={isLoading} />
      </section>
    </div>
  );
}
