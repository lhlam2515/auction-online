import type { AdminStats } from "@repo/shared-types";
import { LayoutDashboard, BarChart3, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsResult = await api.admin.getStats();

        if (statsResult?.success) {
          setStats(statsResult.data);
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

      {/* Placeholder for Charts/Activity */}
      <section className="grid gap-6 md:grid-cols-7">
        {/* Chart area (4 columns) */}
        <Card className="bg-muted/60 col-span-4 flex min-h-[300px] flex-col items-center justify-center border-dashed">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <BarChart3 className="h-10 w-10 opacity-20" />
            <p>Biểu đồ thống kê (Coming soon)</p>
          </div>
        </Card>

        {/* Recent activity area (3 columns) */}
        <Card className="col-span-3 min-h-[300px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground py-10 text-center text-sm">
              Chưa có hoạt động mới
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
