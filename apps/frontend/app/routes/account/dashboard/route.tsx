import type {
  User,
  RatingSummary,
  RatingWithUsers,
  UserStats,
  SpendingAnalytics,
} from "@repo/shared-types";
import { LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SpendingChart } from "@/components/features/analytics";
import {
  RatingSummaryCard,
  RatingHistoryList,
} from "@/components/features/interaction/rating";
import { UserProfileHeader, UserStatsCards } from "@/components/features/user";
import { Spinner } from "@/components/ui/spinner";
import { ERROR_MESSAGES } from "@/constants/api";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bảng Điều Khiển Tài Khoản - Online Auction" },
    {
      name: "description",
      content:
        "Trang bảng điều khiển tài khoản cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [userStats, setUserStats] = useState<UserStats>();
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>();
  const [ratingHistory, setRatingHistory] = useState<RatingWithUsers[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingAnalytics>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const [userRes, statsRes, summaryRes, historyRes, spendingRes] =
          await Promise.all([
            api.users.getProfile(),
            api.users.getBidderStats(),
            api.ratings.getSummary(user.id),
            api.ratings.getByUser(user.id, { page: 1, limit: 10 }),
            api.users.getBidderSpending("30d"),
          ]);

        if (userRes?.success && userRes.data) {
          setUserData(userRes.data);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }

        if (statsRes?.success && statsRes.data) {
          setUserStats(statsRes.data);
        }

        if (summaryRes?.success && summaryRes.data) {
          setRatingSummary(summaryRes.data);
        }

        if (historyRes?.success && historyRes.data) {
          setRatingHistory(historyRes.data.items);
        }

        if (spendingRes?.success && spendingRes.data) {
          setSpendingData(spendingRes.data);
        }
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]);

  const handlePeriodChange = async (period: "7d" | "30d" | "12m") => {
    try {
      setIsLoadingChart(true);
      const response = await api.users.getBidderSpending(period);
      if (response?.success && response.data) {
        setSpendingData(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu biểu đồ");
      console.error("Failed to fetch spending data:", error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <Spinner className="" />
        <span>Đang tải dữ liệu người dùng...</span>
      </div>
    );
  }
  return (
    <div className="space-y-8 pb-10">
      {/* 1. Profile / Header Section */}
      <section>
        {userData && (
          <UserProfileHeader user={{ ...userData, role: user?.role ?? null }} />
        )}
      </section>

      {/* 2. Stats Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            Tổng quan chi tiêu
          </h2>
        </div>
        {userStats && <UserStatsCards stats={userStats} />}
      </section>

      {/* 3. Placeholder for Chart/Recent Activity (Để lấp đầy khoảng trắng dưới cùng) */}
      <section className="grid gap-6 md:grid-cols-7">
        {/* Vùng này dành cho Biểu đồ chi tiêu */}
        <div className="col-span-4">
          {spendingData && (
            <SpendingChart
              data={spendingData}
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
