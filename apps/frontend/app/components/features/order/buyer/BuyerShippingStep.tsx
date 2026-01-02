import type { OrderWithDetails } from "@repo/shared-types";
import { Truck, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import AlertSection from "@/components/common/AlertSection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import { formatDate } from "@/lib/utils";

import ShippingInfo from "../shared/shipping-info";

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
          <Dialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-emerald-500 text-white hover:bg-emerald-700"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Xác nhận đã nhận hàng
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận đã nhận hàng</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn đã nhận được hàng và hài lòng với tình trạng
                  sản phẩm không? Sau khi xác nhận, bạn sẽ được yêu cầu đánh giá
                  người bán.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  disabled={isConfirming}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-emerald-500 text-white hover:bg-emerald-700"
                  onClick={handleConfirmReceived}
                  disabled={isConfirming}
                >
                  Xác nhận đã nhận hàng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerShippingStep;
