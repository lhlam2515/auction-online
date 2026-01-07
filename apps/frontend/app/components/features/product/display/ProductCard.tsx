import type { ProductListing } from "@repo/shared-types";
import {
  Calendar,
  Clock,
  Gavel,
  Heart,
  ShoppingCart,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/routes";
import { useWatchlist } from "@/contexts/watchlist-provider";
import useCountdown from "@/hooks/useCountdown";
import logger from "@/lib/logger";
import { cn, formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: ProductListing;
  className?: string;
};

const NEW_PRODUCT_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

const ProductCard = ({
  product: {
    id,
    name,
    mainImageUrl,
    currentPrice,
    currentWinnerName,
    buyNowPrice,
    startTime,
    endTime,
    bidCount,
    createdAt,
  },
  className,
}: ProductCardProps) => {
  const {
    toggleWatchlist,
    isInWatchlist,
    isLoading: watchlistLoading,
  } = useWatchlist();

  // Memoize để tránh re-compute liên tục
  const isProductInWatchlist = useMemo(
    () => isInWatchlist(id),
    [isInWatchlist, id]
  );

  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);
  const isNew =
    new Date().getTime() - new Date(createdAt).getTime() < NEW_PRODUCT_DURATION;
  const timeDisplay = useCountdown(endDateTime, true);

  const handleToggleWatchlist = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleWatchlist(id);
    } catch (error) {
      logger.error("Failed to toggle watchlist:", error);
    }
  };

  return (
    <Link
      to={APP_ROUTES.PRODUCT(id)}
      className={cn(
        "block h-full w-full max-w-[300px] min-w-[200px]",
        className
      )}
    >
      <Card className="group relative mx-auto overflow-hidden border py-0 transition-all duration-300 hover:shadow-lg">
        {/* 1. Phần Ảnh & Badge */}
        <div className="bg-muted/50 relative overflow-hidden">
          <img
            src={mainImageUrl ?? "/placeholder.png"}
            alt={name}
            className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badge góc trái */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && (
              <Badge variant="default" className="bg-emerald-600">
                New
              </Badge>
            )}
          </div>

          {/* Nút Watchlist góc phải */}
          {!watchlistLoading && (
            <RoleGuard roles={["BIDDER", "SELLER"]}>
              <Button
                size="icon"
                variant="outline"
                className="absolute top-3 right-3 rounded-full border-0 shadow-sm backdrop-blur-sm"
                onClick={handleToggleWatchlist}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${isProductInWatchlist && "fill-destructive text-destructive"}`}
                />
              </Button>
            </RoleGuard>
          )}
        </div>

        {/* 2. Phần Nội dung chính */}
        <CardContent className="flex flex-1 flex-col gap-3">
          {/* Tên sản phẩm */}
          <h3 className="text-foreground line-clamp-2 h-12 text-lg leading-tight font-semibold">
            {name}
          </h3>

          {/* Khu vực Giá & Thời gian */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Giá hiện tại
              </span>
              {/* Thời gian còn lại */}
              <div
                className={`flex items-center text-sm font-medium ${timeDisplay.isUrgent ? "text-destructive" : "text-primary"}`}
              >
                <Clock className="mr-1 h-3.5 w-3.5" />
                {timeDisplay.text}
              </div>
            </div>

            {/* Giá tiền - Font to để handle số tiền lớn */}
            <div className="text-foreground text-2xl font-bold tracking-tight">
              {formatPrice(Number(currentPrice ?? "0"))}
            </div>

            {/* Thông tin phụ: Số lượt bid & Giá mua ngay */}
            <div className="text-muted-foreground mt-1 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Gavel className="text-muted-foreground/60 mr-1.5 h-4 w-4" />
                <span>{bidCount} lượt</span>
              </div>

              {buyNowPrice && (
                <div className="text-muted-foreground flex items-center">
                  <ShoppingCart className="text-muted-foreground/60 mr-1.5 h-4 w-4" />
                  <span className="text-xs font-bold">
                    Mua ngay:{" "}
                    <span className="text-destructive">
                      {formatPrice(Number(buyNowPrice))}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 text-xs [.border-t]:py-3">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
              <User size={14} />
            </div>
            <div>
              <p className="text-muted-foreground/70 text-[10px] font-semibold uppercase">
                Người giữ giá
              </p>
              <p className="text-foreground/90 font-medium">
                {currentWinnerName || "Chưa có"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="mr-1 h-3 w-3" />
            <div>
              <p className="text-muted-foreground/70 text-[10px] font-semibold uppercase">
                Ngày bắt đầu
              </p>
              <p className="text-foreground/90 font-medium">
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
        "block h-full w-full max-w-[300px] min-w-[200px]",
        className
      )}
    >
      <Card className="relative mx-auto animate-pulse gap-3 overflow-hidden border py-0">
        {/* Phần ảnh skeleton */}
        <div className="bg-muted/50 relative overflow-hidden">
          <div className="bg-muted aspect-square h-full w-full" />

          {/* Skeleton button */}
          <div className="bg-muted absolute top-3 right-3 h-10 w-10 rounded-full" />
        </div>

        {/* Nội dung skeleton */}
        <CardContent className="flex flex-1 flex-col gap-3">
          {/* Tên sản phẩm skeleton */}
          <div className="space-y-2">
            <div className="bg-muted h-5 w-3/4 rounded" />
            <div className="bg-muted h-5 w-1/2 rounded" />
          </div>

          {/* Giá và thời gian skeleton */}
          <div className="flex items-center justify-between">
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted h-4 w-16 rounded" />
          </div>

          {/* Giá tiền skeleton */}
          <div className="bg-muted h-8 w-32 rounded" />

          {/* Thông tin phụ skeleton */}
          <div className="flex justify-between">
            <div className="bg-muted h-4 w-16 rounded" />
            <div className="bg-muted h-4 w-24 rounded" />
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 flex items-center justify-between border-t px-4 [.border-t]:py-3">
          <div className="flex items-center gap-2">
            <div className="bg-muted h-6 w-6 rounded-full" />
            <div className="space-y-1">
              <div className="bg-muted h-2 w-16 rounded" />
              <div className="bg-muted h-3 w-12 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-muted h-3 w-3 rounded" />
            <div className="space-y-1">
              <div className="bg-muted h-2 w-16 rounded" />
              <div className="bg-muted h-3 w-20 rounded" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductCard;
