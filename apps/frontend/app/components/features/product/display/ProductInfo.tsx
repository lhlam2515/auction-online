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

import { UserAvatar } from "@/components/common";
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
      <h1 className="text-foreground mb-6 text-3xl font-bold">
        {product.name}
      </h1>

      {/* Current Price Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wide uppercase">
                Giá hiện tại
              </p>
              <p className="text-primary text-4xl font-bold">
                {formatPrice(
                  Number(product.currentPrice ?? product.startPrice)
                )}
              </p>
            </div>
            {product.buyNowPrice && (
              <div className="text-right">
                <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wide uppercase">
                  Mua ngay
                </p>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-destructive h-5 w-5" />
                  <span className="text-destructive text-2xl font-bold">
                    {formatPrice(Number(product.buyNowPrice))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auction Info Card */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            {/* Time Left */}
            <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  timeDisplay.isUrgent ? "bg-destructive" : "bg-primary"
                }`}
              >
                <Clock className="size-5 text-white" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Kết thúc đấu giá lúc
                </p>
                <p
                  className={`text-lg font-semibold ${
                    timeDisplay.isUrgent
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {timeDisplay.text}{" "}
                  {timeDisplay.isUrgent && (
                    <span className="text-muted-foreground text-sm">{`(${formatDate(endDateTime)})`}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Creation Date */}
            <div className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
              <div className="bg-secondary flex h-10 w-10 items-center justify-center rounded-full">
                <Calendar className="text-secondary-foreground h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Đăng bán lúc
                </p>
                <p className="text-foreground text-lg font-semibold">
                  {formatDate(new Date(product.createdAt))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Info */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-3 text-sm font-medium tracking-wide uppercase">
                Người bán
              </p>
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={product.sellerName}
                  imageUrl={product.sellerAvatarUrl}
                />
                <p className="text-foreground text-xl font-bold">
                  {product.sellerName}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 dark:bg-amber-950">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {(product.sellerRatingScore * 100).toFixed(0)}%
              </span>
              <span className="text-muted-foreground text-sm">
                ({product.sellerRatingCount} đánh giá)
              </span>
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
