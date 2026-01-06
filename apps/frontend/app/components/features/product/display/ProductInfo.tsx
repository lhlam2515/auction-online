import type { ProductDetails } from "@repo/shared-types";
import { ShoppingCart, Clock, Calendar } from "lucide-react";
import { Link } from "react-router";

import { UserAvatar } from "@/components/common";
import { RatingBadge } from "@/components/common/badges";
import { Card, CardContent } from "@/components/ui/card";
import { TIME } from "@/constants/api";
import { APP_ROUTES } from "@/constants/routes";
import useCountdown from "@/hooks/useCountdown";
import { cn, formatDate, formatPrice } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductDetails;
  className?: string;
}

const RELATIVE_TIME_THRESHOLD_MS = 3 * TIME.DAY;

const ProductInfo = ({ product, className }: ProductInfoProps) => {
  const endDateTime = new Date(product.endTime);

  let timeDisplay = useCountdown(endDateTime, false);
  const usingRelativeTime =
    endDateTime.getTime() - new Date().getTime() < RELATIVE_TIME_THRESHOLD_MS;
  if (!usingRelativeTime) {
    timeDisplay = {
      text: formatDate(endDateTime),
      isUrgent: false,
    };
  }

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
                  {usingRelativeTime && (
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
                  {product.sellerId === null ? (
                    "Người dùng đã xóa"
                  ) : (
                    <Link
                      to={APP_ROUTES.PROFILE(product.sellerId)}
                      className="hover:underline"
                    >
                      {product.sellerName}
                    </Link>
                  )}
                </p>
              </div>
            </div>

            <RatingBadge
              score={product.sellerRatingScore}
              count={product.sellerRatingCount}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductInfo;
