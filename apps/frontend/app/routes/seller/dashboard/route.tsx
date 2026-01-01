import type { SellerStats, User } from "@repo/shared-types";
import { LayoutDashboard, BarChart3 } from "lucide-react"; // Icons mới
import { useEffect, useState } from "react";
import { toast } from "sonner";

import SellerProfileSection from "@/components/features/seller/SellerProfileSection";
import SellerStatsCards from "@/components/features/seller/SellerStatsCards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Dùng cho placeholder
import { Spinner } from "@/components/ui/spinner";
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
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResult, userResult] = await Promise.all([
          api.seller.getStats(),
          api.users.getProfile(),
        ]);

        if (statsResult?.success) setStats(statsResult.data);
        if (userResult?.success) setUser(userResult.data);
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard");
        console.error("Dashboard data fetch error:", error);
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
        <span>Đang tải dữ liệu người bán...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Profile / Header Section */}
      <section>{user && <SellerProfileSection user={user} />}</section>

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

        {/* Vùng này dành cho Sản phẩm sắp hết hạn / Hoạt động gần đây (chiếm 3 phần) */}
        <Card className="col-span-3 min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
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
