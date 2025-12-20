import type {
  User,
  OrderWithDetails,
  PaginatedResponse,
  MyAutoBid,
} from "@repo/shared-types";
import { BarChart3, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import UserProfileSection from "@/components/features/user/UserProfileSection";
import UserStatsCards from "@/components/features/user/UserStatsCards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Account Dashboard - Online Auction" },
    {
      name: "description",
      content: "Account Dashboard page for Online Auction App",
    },
  ];
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [userOrder, setUserOrder] =
    useState<PaginatedResponse<OrderWithDetails>>();
  const [userAutoBids, setUserAutoBids] = useState<MyAutoBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUserDate = async () => {
      try {
        setIsLoading(true);
        const [userRes, orderRes, autoBidsRes] = await Promise.all([
          api.users.getProfile(),
          api.orders.getAll(),
          api.users.getBids(),
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
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDate();
  }, []);

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
          <UserProfileSection
            user={{ ...userData, role: user?.role ?? null }}
          />
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
