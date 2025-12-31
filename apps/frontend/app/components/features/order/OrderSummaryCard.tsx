import type { OrderWithDetails } from "@repo/shared-types";
import { MessageCircle, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";

interface OrderSummaryCardProps {
  order: OrderWithDetails;
  isSeller?: boolean;
}

export function OrderSummaryCard({
  order,
  isSeller = false,
}: OrderSummaryCardProps) {
  const finalPrice = parseFloat(order.finalPrice);
  const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Thông tin đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={order.product.thumbnail}
            alt={order.product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-card-foreground mb-2 text-lg font-semibold">
            {order.product.name}
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
            <div className="flex items-center justify-between">
              <span className="text-card-foreground">
                {isSeller ? order.winner.fullName : order.seller.fullName}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-1 text-sm",
                  (isSeller
                    ? order.winner.ratingScore
                    : order.seller.ratingScore) >= 0.8
                    ? "border-green-300 bg-green-50 text-green-600"
                    : (isSeller
                          ? order.winner.ratingScore
                          : order.seller.ratingScore) >= 0.5
                      ? "border-amber-300 bg-amber-50 text-amber-600"
                      : "border-red-500 bg-red-50 text-red-600"
                )}
              >
                {(isSeller
                  ? order.winner.ratingScore * 100
                  : order.seller.ratingScore * 100
                ).toFixed(1)}
                % Tích cực
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-muted-foreground flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {isSeller
                    ? order.shippingAddress || "Địa chỉ chưa được cung cấp"
                    : order.seller.address}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button className="w-full cursor-pointer" size="lg">
          <MessageCircle className="h-4 w-4" />
          Chat với {isSeller ? "người mua" : "người bán"}
        </Button>
      </CardContent>
    </Card>
  );
}
