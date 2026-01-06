import type { ProductDetails, User } from "@repo/shared-types";
import { Heart, ShoppingCart, Edit } from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router";

import { AutoBidDialog, BuyNowDialog } from "@/components/features/bidding";
import { Button } from "@/components/ui/button";
import { ACCOUNT_ROUTES, AUTH_ROUTES, SELLER_ROUTES } from "@/constants/routes";
import { useWatchlist } from "@/contexts/watchlist-provider";

interface ProductActionButtonsProps {
  product: ProductDetails;
  isSeller: boolean;
  userData: User | null;
  isEnded: boolean;
  onRefresh?: () => void;
}

const ProductActionButtons = ({
  product,
  isSeller,
  userData,
  isEnded,
  onRefresh,
}: ProductActionButtonsProps) => {
  const {
    toggleWatchlist,
    isInWatchlist,
    isLoading: watchlistLoading,
  } = useWatchlist();

  // Memoize để tránh re-compute liên tục
  const isProductInWatchlist = useMemo(
    () => isInWatchlist(product.id),
    [isInWatchlist, product.id]
  );

  const handleToggleWatchlist = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    await toggleWatchlist(product.id);
  };

  // Complete Order - Product has been won and order created
  if (product.orderId && (isSeller || userData?.id === product.winnerId)) {
    return (
      <div className="flex gap-3">
        <Button
          size="lg"
          variant="default"
          className="h-14 flex-1 text-lg"
          asChild
        >
          <Link
            to={
              isSeller
                ? SELLER_ROUTES.ORDER(product.orderId)
                : ACCOUNT_ROUTES.ORDER(product.orderId)
            }
          >
            <ShoppingCart className="size-6" />
            Xem đơn hàng
          </Link>
        </Button>
      </div>
    );
  }

  // Seller can edit their product
  if (isSeller) {
    return (
      <div className="flex gap-3">
        <Button
          size="lg"
          variant="default"
          className="h-14 flex-1 text-lg"
          asChild
        >
          <Link to={SELLER_ROUTES.PRODUCT(product.id)}>
            <Edit className="size-6" />
            Cập nhật mô tả
          </Link>
        </Button>
      </div>
    );
  }

  // Logged in users can bid/buy (if auction not ended)
  if (userData && !isEnded) {
    return (
      <div className="flex gap-3">
        {/* Bid Button with Dialog */}
        <AutoBidDialog
          product={product}
          userRating={userData?.ratingScore ? userData.ratingScore * 100 : 0}
          onSuccess={onRefresh}
        />

        {/* Buy Now Button with Dialog */}
        {product.buyNowPrice && <BuyNowDialog product={product} />}

        {/* Watchlist Button */}
        <Button
          size="lg"
          variant="secondary"
          className="group h-14 w-14 cursor-pointer"
          onClick={handleToggleWatchlist}
          disabled={watchlistLoading}
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              isProductInWatchlist && "fill-destructive text-destructive"
            }`}
          />
        </Button>
      </div>
    );
  }

  // Not logged in - show login prompt (if auction not ended)
  if (!isEnded) {
    return (
      <p className="text-muted-foreground py-5 text-center font-semibold">
        <Link to={AUTH_ROUTES.LOGIN} className="text-primary hover:underline">
          Đăng nhập
        </Link>{" "}
        hoặc{" "}
        <Link
          to={AUTH_ROUTES.REGISTER}
          className="text-primary hover:underline"
        >
          đăng ký
        </Link>{" "}
        để tham gia đấu giá sản phẩm này
      </p>
    );
  }

  // Auction ended and no action available
  return null;
};

export default ProductActionButtons;
