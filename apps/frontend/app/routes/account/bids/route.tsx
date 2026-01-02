import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { History } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { MyBidsTable } from "@/components/features/bidding";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đấu Giá Của Tôi - Online Auction" },
    {
      name: "description",
      content: "Trang đấu giá của tôi cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function MyBidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<MyAutoBid[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bidsRes, ordersRes] = await Promise.all([
          api.users.getBids(),
          api.orders.getAll(),
        ]);

        if (bidsRes?.success && bidsRes.data) {
          setBids(bidsRes.data);
        } else {
          toast.error("Không thể tải dữ liệu đấu giá");
        }

        if (ordersRes?.success && ordersRes.data) {
          setOrders(ordersRes.data.items || []);
        } else {
          // Orders có thể không có, không cần toast error
          setOrders([]);
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const { activeBids, wonBids, lostBids } = useMemo(() => {
    const now = new Date();
    const active: MyAutoBid[] = [];
    const won: MyAutoBid[] = [];
    const lost: MyAutoBid[] = [];

    bids.forEach((bid) => {
      const isEnded = new Date(bid.product.endTime) <= now;
      if (!isEnded) {
        active.push(bid);
      } else {
        // Đấu giá đã kết thúc
        if (bid.product.winnerId === user?.id) {
          won.push(bid);
        } else {
          lost.push(bid);
        }
      }
    });

    return { activeBids: active, wonBids: won, lostBids: lost };
  }, [bids, user?.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <History className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quản lý đấu giá</CardTitle>
              <CardDescription className="text-lg">
                Xem và quản lý các phiên đấu giá của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
              <span className="ml-2">Đang tải dữ liệu đấu giá...</span>
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Đang đấu giá</TabsTrigger>
                <TabsTrigger value="won">Đã thắng</TabsTrigger>
                <TabsTrigger value="lost">Đã thua</TabsTrigger>
              </TabsList>

              {/* Tab 1: Active Bids */}
              <MyBidsTable variant="active" bids={activeBids} />

              {/* Tab 2: Won Auctions */}
              <MyBidsTable variant="won" bids={wonBids} orders={orders} />

              {/* Tab 3: Lost Auctions */}
              <MyBidsTable variant="lost" bids={lostBids} />
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
