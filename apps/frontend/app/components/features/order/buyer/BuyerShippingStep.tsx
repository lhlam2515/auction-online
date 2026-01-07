import type { OrderWithDetails, ShippingProvider } from "@repo/shared-types";
import { Truck, Package, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { formatDate } from "@/lib/utils";

import { SHIPPING_PROVIDERS, ShippingInfo } from "../shared";

interface BuyerShippingStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const BuyerShippingStep = ({ order, onSuccess }: BuyerShippingStepProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmReceived = async () => {
    setIsConfirming(true);

    try {
      const response = await api.orders.confirmReceived(order.id);

      if (!response.success) {
        throw new Error(
          response.error.message || "Không thể xác nhận nhận hàng"
        );
      }

      toast.success("Xác nhận đã nhận hàng thành công");

      onSuccess?.({
        ...order,
        ...response.data,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi xác nhận nhận hàng"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const getShippingProviderName = (provider: ShippingProvider | null) => {
    return (
      SHIPPING_PROVIDERS.find((p) => p.value === provider)?.label ||
      "Chưa xác định"
    );
  };

  const shippedAt = order.shippedAt ? new Date(order.shippedAt) : new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Đang giao hàng
        </CardTitle>
        <CardDescription>
          Đơn hàng đang trên đường đến địa chỉ của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AlertSection
          variant="info"
          icon={Truck}
          description={`Đơn hàng đã được gửi đi vào ${formatDate(shippedAt)}. Vui lòng kiểm tra hàng kỹ càng khi nhận và xác nhận đã nhận hàng.`}
        />

        {/* Tracking Information */}
        {order.trackingNumber && (
          <AlertSection
            variant="info"
            title="Thông tin vận chuyển"
            description={
              <>
                <div className="flex items-center gap-2">
                  <Building2 className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">
                    Đơn vị vận chuyển:
                  </span>
                  <span className="text-sm font-medium">
                    {getShippingProviderName(order.shippingProvider)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">
                    Mã vận đơn:
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {order.trackingNumber}
                  </span>
                </div>
              </>
            }
          />
        )}

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={
            order.shippingAddress ||
            order.winner?.address ||
            "Địa chỉ không khả dụng"
          }
          phoneNumber={order.phoneNumber || ""}
          isEditable={false}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <ConfirmationDialog
            trigger={
              <Button variant="default" className="cursor-pointer">
                <Package className="h-4 w-4" />
                Xác nhận đã nhận hàng
              </Button>
            }
            variant="success"
            title="Xác nhận đã nhận hàng"
            description="Bạn có chắc chắn đã nhận được hàng và hài lòng với tình trạng sản phẩm không? Sau khi xác nhận, bạn sẽ được yêu cầu đánh giá người bán."
            confirmLabel="Xác nhận đã nhận hàng"
            onConfirm={handleConfirmReceived}
            isConfirming={isConfirming}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerShippingStep;
