import type {
  SellerStats,
  User,
  RatingSummary,
  RatingWithUsers,
} from "@repo/shared-types";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  RatingSummaryCard,
  RatingHistoryList,
} from "@/components/features/interaction/rating";
import {
  SellerProfileHeader,
  SellerStatsCards,
} from "@/components/features/seller";
import { Card } from "@/components/ui/card";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!authUser?.id) return;

      try {
        setIsLoading(true);

        const [statsResult, userResult, summaryRes, historyRes] =
          await Promise.all([
            api.seller.getStats(),
            api.users.getProfile(),
            api.ratings.getSummary(authUser.id),
            api.ratings.getByUser(authUser.id, { page: 1, limit: 10 }),
          ]);

        if (statsResult?.success) setStats(statsResult.data);
        if (userResult?.success) setUser(userResult.data);

        if (summaryRes?.success && summaryRes.data) {
          setRatingSummary(summaryRes.data);
        }

        if (historyRes?.success && historyRes.data) {
          setRatingHistory(historyRes.data.items);
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

      {/* 3. Placeholder for Chart/Recent Activity (Để lấp đầy khoảng trắng dưới cùng) */}
      <section className="grid gap-6 md:grid-cols-7">
        {/* Vùng này dành cho Biểu đồ doanh thu (chiếm 4 phần) */}
        <Card className="bg-muted/60 col-span-4 flex min-h-[300px] flex-col items-center justify-center border-dashed">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <BarChart3 className="h-10 w-10 opacity-20" />
            <p>Biểu đồ doanh thu (Coming soon)</p>
          </div>
        </Card>

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
