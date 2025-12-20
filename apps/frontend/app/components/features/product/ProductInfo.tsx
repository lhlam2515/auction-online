import type { ProductDetails, User } from "@repo/shared-types";
import {
  Heart,
  Star,
  ShoppingCart,
  Gavel,
  Clock,
  Calendar,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TIME } from "@/constants/api";
import { useWatchlist } from "@/contexts/watchlist-provider";
import useCountdown from "@/hooks/useCountdown";
import logger from "@/lib/logger";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { BiddingDialog } from "@/routes/_root/products.$id/BidForm";
import { BuyNowDialog } from "@/routes/_root/products.$id/BuyNowDialog";

interface ProductInfoProps {
  product: ProductDetails;
  isLoggedIn: boolean;
  isSeller: boolean;
  userData?: User;
  className?: string;
  [key: string]: any;
}

const RELATIVE_TIME_THRESHOLD_MS = 3 * TIME.DAY;

export function ProductMainInfo({
  product,
  isLoggedIn,
  isSeller,
  userData,
  className,
}: ProductInfoProps) {
  const {
    toggleWatchlist,
    isInWatchlist,
    isLoading: watchlistLoading,
  } = useWatchlist();

  // State cho BuyNow dialog
  const [showBuyNowDialog, setShowBuyNowDialog] = React.useState(false);

  // State cho BiddingDialog
  const [showBiddingDialog, setShowBiddingDialog] = React.useState(false);

  // Memoize để tránh re-compute liên tục
  const isProductInWatchlist = React.useMemo(
    () => isInWatchlist(product.id),
    [isInWatchlist, product.id]
  );

  const startDateTime = new Date(product.startTime);
  const endDateTime = new Date(product.endTime);
  const isAuctionEnded = new Date() > endDateTime;

  let timeDisplay;
  if (
    endDateTime.getTime() - new Date().getTime() <
    RELATIVE_TIME_THRESHOLD_MS
  ) {
    timeDisplay = useCountdown(endDateTime, false);
  } else {
    timeDisplay = {
      text: formatDate(endDateTime),
      isUrgent: false,
    };
  }

  const handleToggleWatchlist = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleWatchlist(product.id);
    } catch (error) {
      logger.error("Failed to toggle watchlist:", error);
    }
  };

  const handleBuyNowClick = () => {
    if (product.buyNowPrice) {
      setShowBuyNowDialog(true);
    } else {
      toast.error("Sản phẩm này không hỗ trợ mua ngay");
    }
  };

  const handleBidClick = () => {
    if (isLoggedIn) {
      setShowBiddingDialog(true);
    } else {
      toast.error("Vui lòng đăng nhập để đặt giá.");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {product.name}
        </h1>

        {/* Current Price */}
        <div className="mb-4">
          <p className="text-muted-foreground mb-1 text-sm font-medium uppercase">
            Giá hiện tại
          </p>
          <p className="text-accent text-4xl font-bold">
            {formatPrice(Number(product.currentPrice ?? product.startPrice))}
          </p>
        </div>

        {/* Buy Now Price */}
        {product.buyNowPrice && (
          <div className="text-muted-foreground mb-4 flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">
              Mua ngay:{" "}
              <span className="text-red-500">
                {formatPrice(Number(product.buyNowPrice))}
              </span>
            </span>
          </div>
        )}

        {/* Time Left */}
        <div
          className={`mb-4 flex items-center gap-2 ${
            timeDisplay.isUrgent
              ? "font-bold text-red-600"
              : "text-muted-foreground"
          }`}
        >
          <Clock className="h-5 w-5" />
          <span className={"text-lg font-semibold"}>
            Kết thúc đấu giá: {timeDisplay.text}
          </span>
        </div>
        <div className="text-muted-foreground mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span className="text-lg font-semibold">
            Ngày đăng: {formatDate(new Date(product.createdAt))}
          </span>
        </div>
      </div>

      {/* Seller Info */}
      <Card className="bg-slate-50 dark:bg-slate-800">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Người bán</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {product.sellerName}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-lg font-semibold text-amber-500">
                  {product.sellerRatingScore}/10
                </span>
                <span className="text-muted-foreground ml-1 text-sm">
                  ({product.sellerRatingCount} đánh giá)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}

      {isSeller ? (
        <div className="flex gap-3">{/* Buttons for seller */}</div>
      ) : isLoggedIn && !isAuctionEnded ? (
        <div className="flex gap-3">
          <Button
            size="lg"
            className="h-14 flex-1 bg-slate-900 text-lg font-semibold text-white hover:bg-slate-800"
            onClick={handleBidClick}
          >
            <Gavel className="mr-2 h-5 w-5" />
            Đặt giá
          </Button>

          {product.buyNowPrice && (
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent h-14 flex-1 bg-transparent text-lg font-semibold hover:text-white"
              onClick={handleBuyNowClick}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Mua ngay
            </Button>
          )}

          <Button
            size="lg"
            variant="outline"
            className="border-accent text-accent hover:bg-accent h-14 w-14 bg-transparent p-0"
            onClick={handleToggleWatchlist}
            disabled={watchlistLoading}
          >
            <Heart
              className={`h-6 w-6 transition-colors ${isProductInWatchlist && "fill-red-500 text-red-500"}`}
            />
          </Button>
        </div>
      ) : (
        !isAuctionEnded && (
          <div className="text-muted-foreground py-5 text-center font-semibold">
            Đăng nhập để tham gia đấu giá sản phẩm này
          </div>
        )
      )}

      {/* Buy Now Dialog */}
      <BuyNowDialog
        open={showBuyNowDialog}
        onOpenChange={setShowBuyNowDialog}
        product={product}
      />

      {/* Bidding Dialog */}
      <BiddingDialog
        open={showBiddingDialog}
        onOpenChange={setShowBiddingDialog}
        product={product}
        userRating={userData?.ratingScore ? userData?.ratingScore * 100 : 0}
      />
    </div>
  );
}
