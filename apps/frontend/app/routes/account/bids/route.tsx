import type { User, MyAutoBid, Order } from "@repo/shared-types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import BidderHistoryList from "@/components/features/bidder/BidderHistoryList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ERROR_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";
import { formatPrice } from "@/lib/utils";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Bids - Online Auction" },
    { name: "description", content: "My Bids page for Online Auction App" },
  ];
}

function getStatusBadge(
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED"
) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700"
        >
          Chưa thanh toán
        </Badge>
      );
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="border-green-300 bg-amber-50 text-amber-700"
        >
          Đã thanh toán
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-50 text-blue-700"
        >
          Đã vận chuyển
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-300 bg-emerald-50 text-emerald-700"
        >
          Hoàn thành
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-red-300 bg-red-50 text-red-700"
        >
          Đã hủy
        </Badge>
      );
  }
}

export default function MyBidsPage() {
  const [userData, setUserData] = useState<User>();
  const [activeBidsData, setActiveBidsData] = useState<MyAutoBid[]>([]);
  const [userOrder, setUserOrder] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUserDate = async () => {
      try {
        setIsLoading(true);
        const [userRes, bidsRes, orderRes] = await Promise.all([
          api.users.getProfile(),
          api.bids.getMyAutoBid(),
          api.orders.getAll(),
        ]);
        if (userRes?.success && userRes.data) {
          setUserData(userRes.data);
        } else {
          toast.error(userRes?.message || ERROR_MESSAGES.SERVER_ERROR);
        }

        if (bidsRes?.success && bidsRes.data) {
          setActiveBidsData(bidsRes.data);
        } else {
          toast.error(bidsRes?.message || ERROR_MESSAGES.SERVER_ERROR);
        }

        if (orderRes?.success && orderRes.data) {
          setUserOrder(orderRes.data.items);
        } else {
          toast.error(orderRes?.message || ERROR_MESSAGES.SERVER_ERROR);
        }
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDate();
  }, []);

  const now = new Date();

  return (
    <div className="grid">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý đấu giá</CardTitle>
            <CardDescription>
              Theo dõi các phiên đấu giá của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Đang đấu giá</TabsTrigger>
                <TabsTrigger value="won">Đã thắng</TabsTrigger>
              </TabsList>

              {/* Tab 1: Active Bids */}
              <BidderHistoryList />

              {/* Tab 2: Won Auctions */}
              <TabsContent value="won" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Giá cuối</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {userOrder.map((auction) => (
                        <TableRow key={auction.id}>
                          <TableCell className="font-medium">
                            {auction.id}
                          </TableCell>
                          <TableCell>
                            {formatPrice(Number(auction.finalPrice || "0"))}
                          </TableCell>
                          <TableCell>{auction.createdAt.toString()}</TableCell>
                          <TableCell>
                            {getStatusBadge(auction.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            {auction.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="bg-slate-900 hover:bg-slate-800"
                              >
                                Thanh toán
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
