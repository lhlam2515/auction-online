import type { OrderWithDetails } from "@repo/shared-types";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import ShippingInfo from "@/components/features/order/shipping-info";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { cn, formatDate } from "@/lib/utils";

import { CancelOrderDialog } from "./CancelOrderDialog";
import { ConfirmPaymentDialog } from "./ConfirmPaymentDialog";
import { PaymentInfo } from "./PaymentInfo";

interface PaymentConfirmationStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const PaymentConfirmationStep = ({
  order,
  onSuccess,
}: PaymentConfirmationStepProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Check if order is overdue (more than 24 hours old)
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const hoursSinceOrder =
    (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
  const isOverdue = hoursSinceOrder > 24;

  const handleConfirmPayment = async () => {
    setIsConfirming(true);

    try {
      setIsConfirmDialogOpen(false);

      const response = await api.orders.confirmPayment(order.id);

      if (!response.success) {
        throw new Error(
          response.error.message || "Không thể xác nhận thanh toán"
        );
      }

      toast.success(
        "Xác nhận thanh toán thành công. Vui lòng chuẩn bị hàng để gửi đi."
      );

      onSuccess?.({
        ...order,
        ...response.data,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi xác nhận thanh toán"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);

    try {
      setIsCancelDialogOpen(false);

      const response = await api.orders.cancel(order.id, {
        reason: "Người mua chậm thanh toán quá 24 giờ",
      });

      if (!response.success) {
        throw new Error(response.error.message || "Không thể hủy đơn hàng");
      }

      toast.success("Đã hủy đơn hàng thành công");

      onSuccess?.({
        ...order,
        ...response.data,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const paymentStatus = order.payment?.status || "PENDING";
  const isPaid = order.status === "PAID" && paymentStatus === "SUCCESS";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xác nhận thanh toán từ người mua</CardTitle>
        <CardDescription>
          Kiểm tra thông tin thanh toán và xác nhận từ phía người bán
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status Alert */}
        <Alert
          className={cn(
            isPaid
              ? "border-emerald-300 bg-emerald-50 text-emerald-600"
              : "border-amber-300 bg-amber-50 text-amber-600"
          )}
        >
          {isPaid ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <Clock className="h-4 w-4 text-amber-600" />
          )}
          <AlertTitle className="font-semibold">
            {isPaid ? "Thanh toán đã được xác nhận" : "Chờ xác nhận thanh toán"}
          </AlertTitle>
          <AlertDescription
            className={cn(isPaid ? "text-emerald-600" : "text-amber-600")}
          >
            {isPaid
              ? `Người mua đã thanh toán vào ${formatDate(
                  order.payment?.paidAt || new Date()
                )}. Vui lòng chuẩn bị hàng và bàn giao trong vòng 24-48 giờ.`
              : "Người mua chưa hoàn tất thanh toán. Vui lòng đợi hoặc liên hệ với người mua để nhắc nhở."}
          </AlertDescription>
        </Alert>

        {/* Payment Details */}
        {isPaid && order.payment && <PaymentInfo payment={order.payment} />}

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={order.shippingAddress || order.winner.address}
          phoneNumber={order.phoneNumber || ""}
          isEditable={false}
        />

        {/* Action Buttons */}
        {!isPaid ? (
          <div className="space-y-4">
            <Alert className="border-amber-300 bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">
                Chưa thể bàn giao hàng
              </AlertTitle>
              <AlertDescription className="text-amber-600">
                Vui lòng chờ người mua hoàn tất thanh toán trước khi tiếp tục.
                {isOverdue && (
                  <span className="mt-2 block font-medium">
                    Đơn hàng đã quá 24 giờ. Bạn có thể hủy giao dịch nếu cần.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Cancel Order Button - Only show if overdue */}
            {isOverdue && (
              <div className="flex justify-end gap-3 pt-4">
                <CancelOrderDialog
                  isOpen={isCancelDialogOpen}
                  onOpenChange={setIsCancelDialogOpen}
                  isCancelling={isCancelling}
                  onCancelOrder={handleCancelOrder}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end gap-3 pt-4">
            <ConfirmPaymentDialog
              isOpen={isConfirmDialogOpen}
              onOpenChange={setIsConfirmDialogOpen}
              isConfirming={isConfirming}
              onConfirmPayment={handleConfirmPayment}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentConfirmationStep;
