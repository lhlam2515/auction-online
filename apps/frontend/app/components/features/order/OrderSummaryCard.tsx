import type { OrderWithDetails } from "@repo/shared-types";
import { MessageCircle, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";

interface OrderSummaryCardProps {
  order: OrderWithDetails;
  sellerRating?: number;
  showSellerDetails?: boolean;
  onChatWithSeller?: () => void;
}

export function OrderSummaryCard({
  order,
  onChatWithSeller,
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
          <h4 className="text-card-foreground mb-2 font-semibold">Người bán</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-card-foreground">
                {order.seller.fullName}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  order.seller.ratingScore >= 0.8
                    ? "border-green-500 text-green-600"
                    : order.seller.ratingScore >= 0.5
                      ? "border-yellow-500 text-yellow-600"
                      : "border-red-500 text-red-600",
                  "px-2 py-1 text-sm"
                )}
              >
                {order.seller.ratingScore}% Tích cực
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-muted-foreground flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{order.seller.address}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          className="w-full cursor-pointer"
          size="lg"
          onClick={onChatWithSeller}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat với người bán
        </Button>
      </CardContent>
    </Card>
  );
}
