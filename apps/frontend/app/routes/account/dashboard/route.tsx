import type {
  User,
  OrderWithDetails,
  PaginatedResponse,
  MyAutoBid,
  RatingSummary,
  RatingWithUsers,
} from "@repo/shared-types";
import { BarChart3, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  RatingSummaryCard,
  RatingHistoryList,
} from "@/components/features/interaction/rating";
import { UserProfileHeader, UserStatsCards } from "@/components/features/user";
import { Card } from "@/components/ui/card";
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
  const [userOrder, setUserOrder] =
    useState<PaginatedResponse<OrderWithDetails>>();
  const [userAutoBids, setUserAutoBids] = useState<MyAutoBid[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>();
  const [ratingHistory, setRatingHistory] = useState<RatingWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const [userRes, orderRes, autoBidsRes, summaryRes, historyRes] =
          await Promise.all([
            api.users.getProfile(),
            api.orders.getAll(),
            api.users.getBids(),
            api.ratings.getSummary(user.id),
            api.ratings.getByUser(user.id, { page: 1, limit: 10 }),
          ]);

        if (userRes?.success && userRes.data) {
          setUserData(userRes.data);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }

        if (orderRes?.success && orderRes.data) {
          setUserOrder(orderRes.data);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }

        if (autoBidsRes?.success && autoBidsRes.data) {
          setUserAutoBids(autoBidsRes.data);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }

        if (summaryRes?.success && summaryRes.data) {
          setRatingSummary(summaryRes.data);
        }

        if (historyRes?.success && historyRes.data) {
          setRatingHistory(historyRes.data.items);
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
        {userOrder && (
          <UserStatsCards stats={userOrder.items} autoBids={userAutoBids} />
        )}
      </section>

      {/* 3. Placeholder for Chart/Recent Activity (Để lấp đầy khoảng trắng dưới cùng) */}
      <section className="grid gap-6 md:grid-cols-7">
        {/* Vùng này dành cho Biểu đồ doanh thu (chiếm 4 phần) */}
        <Card className="bg-muted/60 col-span-4 flex min-h-[300px] flex-col items-center justify-center border-dashed">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <BarChart3 className="h-10 w-10 opacity-20" />
            <p>Biểu đồ chi tiêu (Coming soon)</p>
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
