import type { ProductListing } from "@repo/shared-types";
import {
  Calendar,
  Clock,
  Gavel,
  Heart,
  ShoppingCart,
  User,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductListing;
  className?: string;
};

const NEW_PRODUCT_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
}

function formatTimeRemaining(endTime: Date): {
  text: string;
  isUrgent: boolean;
} {
  const now = new Date();
  const diffMs = endTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      text: "Đã kết thúc",
      isUrgent: true,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const isUrgent = diffMs < 60 * 60 * 1000; // dưới 1 giờ

  let timeText = "";
  if (days > 0) timeText += `${days}d `;
  if (hours > 0) timeText += `${hours}h `;
  if (minutes > 0) timeText += `${minutes}m `;
  if (seconds >= 0 && days === 0) timeText += `${seconds}s`;

  return {
    text: timeText.trim(),
    isUrgent,
  };
}

// Custom hook để đếm ngược tự động
function useCountdown(endTime: Date) {
  const [timeDisplay, setTimeDisplay] = React.useState(() =>
    formatTimeRemaining(endTime)
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeDisplay(formatTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeDisplay;
}

/**
 * Component: ProductCard
 * Generated automatically based on Project Auction SRS.
 */
const ProductCard = ({
  product: {
    id,
    name,
    mainImageUrl,
    slug,
    currentPrice,
    currentWinnerName,
    buyNowPrice,
    startTime,
    endTime,
    bidCount,
    isWatching,
  },
  className,
}: ProductCardProps) => {
  const [isWatchlisted, setIsWatchlisted] = React.useState(isWatching);

  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);
  const isNew =
    new Date().getTime() - startDateTime.getTime() < NEW_PRODUCT_DURATION;
  const timeDisplay = useCountdown(endDateTime);

  const toggleWatchlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const prevIsWatchlisted = isWatchlisted;
    try {
      setIsWatchlisted(!prevIsWatchlisted);
      await api.users.toggleWatchlist(id);
    } catch (error) {
      setIsWatchlisted(prevIsWatchlisted);
      logger.error("Failed to toggle watchlist:", error);
    }
  };

  return (
    <Link
      to={APP_ROUTES.PRODUCT(id)}
      className={cn(
        "block h-full w-full max-w-[300px] min-w-[250px]",
        className
      )}
    >
      <Card className="group relative mx-auto overflow-hidden border py-0 transition-all duration-300 hover:shadow-lg">
        {/* 1. Phần Ảnh & Badge */}
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={mainImageUrl ?? "/placeholder.png"}
            alt={name}
            className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badge góc trái */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && (
              <Badge variant="default" className="bg-green-400">
                New
              </Badge>
            )}
          </div>

          {/* Nút Watchlist góc phải */}
          <Button
            size="icon"
            variant="outline"
            className="absolute top-3 right-3 rounded-full border-0 bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
            onClick={toggleWatchlist}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isWatchlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </Button>
        </div>

        {/* 2. Phần Nội dung chính */}
        <CardContent className="flex flex-1 flex-col gap-3">
          {/* Tên sản phẩm */}
          <h3 className="line-clamp-2 h-13 text-lg leading-tight font-semibold text-gray-900">
            {name}
          </h3>

          {/* Khu vực Giá & Thời gian */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Giá hiện tại
              </span>
              {/* Thời gian còn lại */}
              <div
                className={`flex items-center text-sm font-medium ${timeDisplay.isUrgent ? "text-red-600" : "text-blue-600"}`}
              >
                <Clock className="mr-1 h-3.5 w-3.5" />
                {timeDisplay.text}
              </div>
            </div>

            {/* Giá tiền - Font to để handle số tiền lớn */}
            <div className="text-accent text-2xl font-bold tracking-tight">
              {formatCurrency(currentPrice ?? "0")}
            </div>

            {/* Thông tin phụ: Số lượt bid & Giá mua ngay */}
            <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Gavel className="mr-1.5 h-4 w-4 text-gray-400" />
                <span>{bidCount} lượt</span>
              </div>

              {buyNowPrice && (
                <div className="flex items-center text-gray-500">
                  <ShoppingCart className="mr-1.5 h-4 w-4 text-gray-400" />
                  <span className="text-xs font-bold">
                    Mua ngay:{" "}
                    <span className="text-red-500">
                      {formatCurrency(buyNowPrice)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-gray-50 px-4 text-xs text-gray-500 [.border-t]:py-3">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User size={14} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase">
                Người giữ giá
              </p>
              <p className="font-medium text-gray-700">
                {currentWinnerName || "Chưa có"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="mr-1 h-3 w-3" />
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase">
                Ngày bắt đầu
              </p>
              <p className="font-medium text-gray-700">
                {startDateTime.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

/**
 * ProductCardSkeleton - Loading state cho ProductCard
 */
export const ProductCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "block h-full w-full max-w-[300px] min-w-[250px]",
        className
      )}
    >
      <Card className="relative mx-auto animate-pulse gap-3 overflow-hidden border py-0">
        {/* Phần ảnh skeleton */}
        <div className="relative overflow-hidden bg-gray-200">
          <div className="aspect-square h-full w-full bg-gray-300" />

          {/* Skeleton button */}
          <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Nội dung skeleton */}
        <CardContent className="flex flex-1 flex-col gap-3">
          {/* Tên sản phẩm skeleton */}
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded bg-gray-300" />
            <div className="h-5 w-1/2 rounded bg-gray-300" />
          </div>

          {/* Giá và thời gian skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-gray-300" />
            <div className="h-4 w-16 rounded bg-gray-300" />
          </div>

          {/* Giá tiền skeleton */}
          <div className="h-8 w-32 rounded bg-gray-300" />

          {/* Thông tin phụ skeleton */}
          <div className="flex justify-between">
            <div className="h-4 w-16 rounded bg-gray-300" />
            <div className="h-4 w-24 rounded bg-gray-300" />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-gray-50 px-4 [.border-t]:py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gray-300" />
            <div className="space-y-1">
              <div className="h-2 w-16 rounded bg-gray-300" />
              <div className="h-3 w-12 rounded bg-gray-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-300" />
            <div className="space-y-1">
              <div className="h-2 w-16 rounded bg-gray-300" />
              <div className="h-3 w-20 rounded bg-gray-300" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductCard;
