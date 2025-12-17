import type { User, MyAutoBid, Order } from "@repo/shared-types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import BidderHistoryList from "@/components/features/bidder/BidderHistoryList";
import WonAuctionList from "@/components/features/bidder/WonAuctionList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ERROR_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Bids - Online Auction" },
    { name: "description", content: "My Bids page for Online Auction App" },
  ];
}

export default function MyBidsPage() {
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
              <WonAuctionList />
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
