import type { ProductDetails, User } from "@repo/shared-types";
import {
  Heart,
  Star,
  ShoppingCart,
  Clock,
  Calendar,
  Pencil,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { AutoBidDialog, BuyNowDialog } from "@/components/features/bidding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TIME } from "@/constants/api";
import { ACCOUNT_ROUTES, SELLER_ROUTES } from "@/constants/routes";
import { useWatchlist } from "@/contexts/watchlist-provider";
import useCountdown from "@/hooks/useCountdown";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { cn, formatDate, formatPrice } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductDetails;
  isLoggedIn: boolean;
  isSeller: boolean;
  userId?: string;
  className?: string;
}

const RELATIVE_TIME_THRESHOLD_MS = 3 * TIME.DAY;

const ProductInfo = ({
  product,
  isLoggedIn,
  isSeller,
  userId,
  className,
}: ProductInfoProps) => {
  const {
    toggleWatchlist,
    isInWatchlist,
    isLoading: watchlistLoading,
  } = useWatchlist();

  const [userData, setUserData] = useState<User>();

  // Memoize để tránh re-compute liên tục
  const isProductInWatchlist = useMemo(
    () => isInWatchlist(product.id),
    [isInWatchlist, product.id]
  );

  const endDateTime = new Date(product.endTime);
  const isAuctionEnded = new Date() > endDateTime;

  let timeDisplay = useCountdown(endDateTime, false);
  if (
    endDateTime.getTime() - new Date().getTime() >=
    RELATIVE_TIME_THRESHOLD_MS
  ) {
    timeDisplay = {
      text: formatDate(endDateTime),
      isUrgent: false,
    };
  }

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!isMounted || !isLoggedIn) return;

      try {
        const result = await api.users.getProfile();

        if (!result.success) {
          throw new Error(
            result.error?.message || "Không thể tải dữ liệu người dùng"
          );
        }

        if (isMounted && result.data) {
          setUserData(result.data);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = getErrorMessage(
            error,
            "Có lỗi khi tải dữ liệu người dùng"
          );
          showError(error, errorMessage);
        }
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const handleToggleWatchlist = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    await toggleWatchlist(product.id);
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
                  {product.sellerRatingScore * 100}%
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
      {product.orderId && (isSeller || userId === product.winnerId) ? (
        <div className="flex gap-3">
          {/* Complete Order */}
          <Button
            size="lg"
            variant="default"
            className="flex h-14 flex-1 items-center gap-2 bg-slate-900 text-lg font-semibold text-white hover:bg-slate-800"
            asChild
          >
            <Link
              to={
                isSeller
                  ? SELLER_ROUTES.ORDER(product.orderId)
                  : ACCOUNT_ROUTES.ORDER(product.orderId)
              }
            >
              <ShoppingCart className="h-4 w-4" />
              Hoàn tất đơn hàng
            </Link>
          </Button>
        </div>
      ) : isSeller ? (
        <div className="flex gap-3">
          {/* Edit Product */}
          <Button
            size="lg"
            variant="default"
            className="flex h-14 flex-1 items-center gap-2 bg-slate-900 text-lg font-semibold text-white hover:bg-slate-800"
            asChild
          >
            <Link to={SELLER_ROUTES.PRODUCT(product.id)}>
              <Pencil className="h-4 w-4" />
              Chỉnh sửa sản phẩm
            </Link>
          </Button>
        </div>
      ) : isLoggedIn && !isAuctionEnded ? (
        <div className="flex gap-3">
          {/* Bid Button with Dialog */}
          <AutoBidDialog
            product={product}
            userRating={userData?.ratingScore ? userData?.ratingScore * 100 : 0}
          />

          {/* Buy Now Button with Dialog */}
          {product.buyNowPrice && <BuyNowDialog product={product} />}

          <Button
            size="lg"
            variant="outline"
            className="border-accent text-accent hover:bg-accent h-14 w-14 cursor-pointer bg-transparent p-0"
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
    </div>
  );
};

export default ProductInfo;
