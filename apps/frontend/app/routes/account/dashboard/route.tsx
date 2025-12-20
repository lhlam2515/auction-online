import type {
  User,
  OrderWithDetails,
  PaginatedResponse,
} from "@repo/shared-types";
import { Star, DollarSign, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";
import { formatPrice } from "@/lib/utils";

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
  const [userData, setUserData] = useState<User>();
  const [userOrder, setUserOrder] =
    useState<PaginatedResponse<OrderWithDetails>>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUserDate = async () => {
      try {
        setIsLoading(true);
        const [userRes, orderRes] = await Promise.all([
          api.users.getProfile(),
          api.orders.getAll(),
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
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDate();
  }, []);
  const totalOrders = userOrder?.items.length;
  const orders = userOrder?.items.filter((item) => item.status === "COMPLETED");
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar - User Info */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={userData?.avatarUrl || "/placeholder.svg"}
                    alt={userData?.username || "User Avatar"}
                  />
                  <AvatarFallback className="bg-slate-900 text-2xl text-white">
                    {userData?.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold">{userData?.fullName}</h2>
                  <p className="text-muted-foreground text-sm">
                    {userData?.email}
                  </p>
                </div>

                {/* Rating Score */}
                <div className="w-full border-t pt-4">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-muted-foreground text-sm font-medium">
                      Điểm đánh giá
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {userData?.ratingScore}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content - Tabs */}

        <aside className="lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Card 1: Tổng chi tiêu */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {formatPrice(
                      userOrder?.items.reduce(
                        (total, item) => total + Number(item.finalPrice ?? 0),
                        0
                      ) || 0
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Tổng chi tiêu
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Tổng đơn đặt hàng */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {totalOrders || "0"}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Tổng đơn đặt hàng
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Đơn thành công */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {orders?.length || "0"}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Tổng đơn thành công
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
