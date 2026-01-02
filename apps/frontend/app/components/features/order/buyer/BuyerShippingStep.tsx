import type { OrderWithDetails } from "@repo/shared-types";
import { Truck, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { formatDate } from "@/lib/utils";

import { ShippingInfo } from "../shared";

interface BuyerShippingStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const BuyerShippingStep = ({ order, onSuccess }: BuyerShippingStepProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleConfirmReceived = async () => {
    setIsConfirming(true);

    try {
      setIsConfirmDialogOpen(false);

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
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900">
              Thông tin vận chuyển
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-600">Mã vận đơn:</span>
                <span className="font-mono text-sm font-medium text-slate-900">
                  {order.trackingNumber}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={order.shippingAddress || order.winner.address}
          phoneNumber={order.phoneNumber || ""}
          isEditable={false}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <ConfirmationDialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
            triggerLabel="Xác nhận đã nhận hàng"
            triggerIcon={Package}
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
