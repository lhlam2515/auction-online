import type { User, Bid } from "@repo/shared-types";
import { Trash2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProductCard from "@/components/features/product/ProductCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// import { ProductCard } from "@/components/ui/product-card"

// Mock Watchlist data
// import { ProductCard } from "@/components/ui/product-card"

// Mock Won Auctions data

// Mock Watchlist data
const watchlistItems = [
  {
    id: "5",
    name: "Rolex Submariner Date",
    image: "/placeholder.svg?height=300&width=400",
    currentPrice: 250000000,
    buyNowPrice: 280000000,
    topBidder: "****Minh",
    bidCount: 45,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isNew: false,
  },
  {
    id: "6",
    name: "Gaming PC RTX 4090",
    image: "/placeholder.svg?height=300&width=400",
    currentPrice: 65000000,
    buyNowPrice: 75000000,
    topBidder: "****Hùng",
    bidCount: 28,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    isNew: true,
  },
  {
    id: "7",
    name: "Louis Vuitton Neverfull MM",
    image: "/placeholder.svg?height=300&width=400",
    currentPrice: 35000000,
    topBidder: "****Lan",
    bidCount: 18,
    endTime: new Date(Date.now() + 45 * 60 * 1000),
    isNew: false,
  },
];

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
  const [activeBidsData, setActiveBidsData] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUserDate = async () => {
      try {
        setIsLoading(true);
        const [userRes, bidsRes] = await Promise.all([
          api.users.getProfile(),
          api.users.getBids({ page: 1, limit: 10 }),
        ]);
        if (userRes?.success && userRes.data) {
          setUserData(userRes.data);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }

        if (bidsRes?.success && bidsRes.data) {
          setActiveBidsData(bidsRes.data.items);
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
  const [watchlist, setWatchlist] = useState(watchlistItems);

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
  };

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

        <Card></Card>
      </div>
    </div>
  );
}
