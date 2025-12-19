import type { MyAutoBid, OrderWithDetails } from "@repo/shared-types";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import BidderHistoryList from "@/components/features/bidder/BidderHistoryList";
import LoseAuctionList from "@/components/features/bidder/LoseAuctionList";
import WonAuctionList from "@/components/features/bidder/WonAuctionList";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Bids - Online Auction" },
    { name: "description", content: "My Bids page for Online Auction App" },
  ];
}

export default function MyBidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<MyAutoBid[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Quản lý đấu giá
          </h1>
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Quản lý đấu giá
        </h1>
        <p className="text-slate-600">Theo dõi các phiên đấu giá của bạn</p>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Đang đấu giá</TabsTrigger>
              <TabsTrigger value="won">Đã thắng</TabsTrigger>
              <TabsTrigger value="lost">Đã thua</TabsTrigger>
            </TabsList>

            {/* Tab 1: Active Bids */}
            <BidderHistoryList activeBids={activeBids} />

            {/* Tab 2: Won Auctions */}
            <WonAuctionList wonBids={wonBids} orders={orders} />

            {/* Tab 3: Lost Auctions */}
            <LoseAuctionList lostBids={lostBids} />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
