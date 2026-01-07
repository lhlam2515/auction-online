import type { OrderWithDetails } from "@repo/shared-types";
import { MessageCircle, MapPin, Package } from "lucide-react";
import { useState } from "react";

import { RatingBadge } from "@/components/common/badges";
import { PrivateChatWindow } from "@/components/features/interaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryCardProps {
  order: OrderWithDetails;
  isSeller?: boolean;
}

const OrderSummaryCard = ({
  order,
  isSeller = false,
}: OrderSummaryCardProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const finalPrice = parseFloat(order.finalPrice);
  const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            {order.product?.thumbnail ? (
              <img
                src={order.product.thumbnail}
                alt={order.product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-muted/50 flex h-full w-full items-center justify-center">
                <Package className="text-muted-foreground h-16 w-16" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-card-foreground mb-2 text-lg font-semibold">
              {order.product?.name || "Sản phẩm không khả dụng"}
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá thành:</span>
                <span className="text-card-foreground font-bold">
                  {formatPrice(finalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đấu giá:</span>
                <span className="text-card-foreground">{orderDate}</span>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-card-foreground mb-2 font-semibold">
              {isSeller ? "Người mua" : "Người bán"}
            </h4>
            <div className="space-y-2">
              {(isSeller ? order.winner : order.seller) ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">
                      {isSeller
                        ? order.winner!.fullName
                        : order.seller!.fullName}
                    </span>

                    <RatingBadge
                      score={
                        isSeller
                          ? order.winner!.ratingScore
                          : order.seller!.ratingScore
                      }
                      className={
                        (isSeller
                          ? order.winner!.ratingScore
                          : order.seller!.ratingScore) >= 0.8
                          ? "border-emerald-500/20 bg-emerald-500/10"
                          : (isSeller
                                ? order.winner!.ratingScore
                                : order.seller!.ratingScore) >= 0.5
                            ? "border-amber-500/20 bg-amber-500/10"
                            : "border-destructive/20 bg-destructive/10"
                      }
                    />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        {isSeller
                          ? order.shippingAddress ||
                            "Địa chỉ chưa được cung cấp"
                          : order.seller!.address || "Địa chỉ không khả dụng"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground italic">
                  Thông tin {isSeller ? "người mua" : "người bán"} không khả
                  dụng
                </span>
              )}
            </div>
          </div>
          <Button
            className="w-full cursor-pointer"
            size="lg"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Chat với {isSeller ? "người mua" : "người bán"}
          </Button>
        </CardContent>
      </Card>

      <PrivateChatWindow
        order={order}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default OrderSummaryCard;
