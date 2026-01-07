import type { AdminAnalytics, AdminStats } from "@repo/shared-types";
import { LayoutDashboard, BarChart3, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  CategoryGMVChart,
  TopCategoriesChart,
  AuctionSuccessGauge,
  BidDensityChart,
  SellerFunnelChart,
  TransactionPipelineChart,
  ReputationDistChart,
  BiddingActivityChart,
} from "@/components/features/admin/charts";
import { AdminStatsCards } from "@/components/features/admin/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bảng Điều Khiển Quản Trị - Online Auction" },
    {
      name: "description",
      content: "Trang bảng điều khiển quản trị cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResult, analyticsResult] = await Promise.all([
          api.admin.getStats(),
          api.admin.getAnalytics(),
        ]);

        if (statsResult?.success) {
          setStats(statsResult.data);
        }

        if (analyticsResult?.success) {
          setAnalytics(analyticsResult.data);
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard");
        console.error("Admin dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <Spinner className="" />
        <span>Đang tải dữ liệu quản trị...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hệ thống đấu giá
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            Thống kê tổng quan
          </h2>
        </div>
        {stats && <AdminStatsCards stats={stats} />}
      </section>

      {/* Charts Section */}
      {analytics && (
        <>
          {/* Category Insights */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-muted-foreground h-5 w-5" />
              <h2 className="text-lg font-semibold tracking-tight">
                Phân tích danh mục
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>GMV theo danh mục</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryGMVChart
                    data={analytics.categoryInsights.gmvByCategory}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 danh mục</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopCategoriesChart
                    data={analytics.categoryInsights.topCategories}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Auction Health */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="text-muted-foreground h-5 w-5" />
              <h2 className="text-lg font-semibold tracking-tight">
                Sức khỏe đấu giá
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tỷ lệ thành công</CardTitle>
                </CardHeader>
                <CardContent>
                  <AuctionSuccessGauge stats={analytics.auctionHealth.stats} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 sản phẩm nhiều lượt bid</CardTitle>
                </CardHeader>
                <CardContent>
                  <BidDensityChart
                    data={analytics.auctionHealth.bidDensityTop10}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Operations */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-muted-foreground h-5 w-5" />
              <h2 className="text-lg font-semibold tracking-tight">Vận hành</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Phễu chuyển đổi Seller</CardTitle>
                </CardHeader>
                <CardContent>
                  <SellerFunnelChart data={analytics.operations.sellerFunnel} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quy trình đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionPipelineChart
                    data={analytics.operations.transactionPipeline}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Engagement */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="text-muted-foreground h-5 w-5" />
              <h2 className="text-lg font-semibold tracking-tight">
                Tương tác & Uy tín
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Phân phối uy tín người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReputationDistChart
                    data={analytics.engagement.reputationDistribution}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động đấu thầu (30 ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BiddingActivityChart
                    data={analytics.engagement.biddingActivity}
                  />
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
