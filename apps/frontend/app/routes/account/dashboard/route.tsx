import type {
  User,
  Bid,
  MyAutoBid,
  Order,
  PaginatedResponse,
} from "@repo/shared-types";
import { Trash2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

// Mock Active Bids data
const activeBids = [
  {
    id: "1",
    productName: "iPhone 15 Pro Max 256GB",
    currentPrice: 28500000,
    myMaxBid: 30000000,
    status: "leading" as const,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    productName: "MacBook Pro M3 14 inch",
    currentPrice: 45000000,
    myMaxBid: 44000000,
    status: "outbid" as const,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    productName: "Samsung Galaxy S24 Ultra",
    currentPrice: 25000000,
    myMaxBid: 26000000,
    status: "leading" as const,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    image: "/placeholder.svg?height=200&width=200",
  },
];

// Mock Won Auctions data
const wonAuctions = [
  {
    id: "1",
    productName: "iPad Pro 12.9 inch M2",
    finalPrice: 22000000,
    wonDate: "15/01/2024",
    status: "unpaid" as const,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    productName: "Sony WH-1000XM5 Headphones",
    finalPrice: 6500000,
    wonDate: "12/01/2024",
    status: "processing" as const,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    productName: "Apple Watch Series 9",
    finalPrice: 9000000,
    wonDate: "08/01/2024",
    status: "completed" as const,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "4",
    productName: "Canon EOS R6 Mark II",
    finalPrice: 52000000,
    wonDate: "05/01/2024",
    status: "cancelled" as const,
    image: "/placeholder.svg?height=200&width=200",
  },
];

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

function formatVietnameseCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Account Dashboard - Online Auction" },
    {
      name: "description",
      content: "Account Dashboard page for Online Auction App",
    },
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

export default function AccountDashboardPage() {
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

  const [watchlist, setWatchlist] = useState(watchlistItems);

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
  };
  const now = new Date();

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
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý đấu giá</CardTitle>
              <CardDescription>
                Theo dõi các phiên đấu giá của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Đang đấu giá</TabsTrigger>
                  <TabsTrigger value="won">Đã thắng</TabsTrigger>
                  <TabsTrigger value="watchlist">Yêu thích</TabsTrigger>
                </TabsList>

                {/* Tab 1: Active Bids */}
                <TabsContent value="active" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead>Giá hiện tại</TableHead>
                          <TableHead>Giá tối đa của bạn</TableHead>
                          <TableHead>Kết thúc</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeBidsData
                          .filter((bid) => new Date(bid.product.endTime) > now)
                          .map((bid) => (
                            <TableRow key={bid.id}>
                              <TableCell className="font-medium">
                                {bid.product.productName}
                              </TableCell>
                              <TableCell>
                                {formatVietnameseCurrency(
                                  Number(bid.product.currentPrice || 0)
                                )}
                              </TableCell>
                              <TableCell>
                                {formatVietnameseCurrency(
                                  Number(bid.maxAmount || 0)
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(bid.product.endTime).toLocaleString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                {Number(bid.product.currentPrice) <=
                                Number(bid.maxAmount) ? (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                    Đang dẫn đầu
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-300 bg-amber-50 text-amber-700"
                                  >
                                    Bị trả giá
                                  </Badge>
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                {Number(bid.product.currentPrice) >
                                  Number(bid.maxAmount) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-300 bg-transparent text-amber-700"
                                  >
                                    Đấu lại
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

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
                          <TableHead className="text-right">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {userOrder.map((auction) => (
                          <TableRow key={auction.id}>
                            <TableCell className="font-medium">
                              {auction.id}
                            </TableCell>
                            <TableCell>
                              {formatVietnameseCurrency(
                                Number(auction.finalPrice || "0")
                              )}
                            </TableCell>
                            <TableCell>
                              {auction.createdAt.toString()}
                            </TableCell>
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

                {/* Tab 3: Watchlist */}
                <TabsContent value="watchlist" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {watchlist.map((item) => (
                      <div key={item.id} className="group relative">
                        {/* <ProductCard
                          id={item.id}
                          name={item.name}
                          image={item.image}
                          currentPrice={item.currentPrice}
                          buyNowPrice={item.buyNowPrice}
                          topBidder={item.topBidder}
                          bidCount={item.bidCount}
                          endTime={item.endTime}
                          isNew={item.isNew}
                        /> */}
                        {/* Remove button overlay */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromWatchlist(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {watchlist.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        Chưa có sản phẩm yêu thích nào
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
