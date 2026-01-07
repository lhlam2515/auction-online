import type { OrderWithDetails } from "@repo/shared-types";
import { CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
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

import { PaymentInfoDisplay, ShippingInfo } from "../shared";

interface SellerPaymentStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const SellerPaymentStep = ({ order, onSuccess }: SellerPaymentStepProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Check if order is overdue (more than 24 hours old)
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const hoursSinceOrder =
    (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
  const isOverdue = hoursSinceOrder > 24;

  const handleConfirmPayment = async () => {
    setIsConfirming(true);

    try {
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
        <AlertSection
          variant={isPaid ? "success" : "warning"}
          icon={isPaid ? CheckCircle2 : Clock}
          title={
            isPaid ? "Thanh toán đã được xác nhận" : "Chờ xác nhận thanh toán"
          }
          description={
            isPaid
              ? `Người mua đã thanh toán vào ${formatDate(
                  order.payment?.paidAt || new Date()
                )}. Vui lòng chuẩn bị hàng và bàn giao trong vòng 24-48 giờ.`
              : "Người mua chưa hoàn tất thanh toán. Vui lòng đợi hoặc liên hệ với người mua để nhắc nhở."
          }
        />

        {/* Payment Details */}
        {isPaid && order.payment && (
          <PaymentInfoDisplay payment={order.payment} />
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
        {!isPaid ? (
          <div className="space-y-4">
            <AlertSection
              variant="warning"
              icon={AlertCircle}
              title="Chưa thể bàn giao hàng"
              description={
                <>
                  Vui lòng chờ người mua hoàn tất thanh toán trước khi tiếp tục.
                  {isOverdue && (
                    <span className="mt-2 block font-medium">
                      Đơn hàng đã quá 24 giờ. Bạn có thể hủy giao dịch nếu cần.
                    </span>
                  )}
                </>
              }
            />

            {/* Cancel Order Button - Only show if overdue */}
            {isOverdue && (
              <div className="flex justify-end gap-3 pt-4">
                <ConfirmationDialog
                  trigger={
                    <Button variant="destructive">
                      <XCircle className="mr-1 h-4 w-4" />
                      Hủy giao dịch
                    </Button>
                  }
                  variant="danger"
                  title="Hủy giao dịch"
                  description={
                    <>
                      Bạn có chắc chắn muốn hủy đơn hàng này không?
                      <span className="block font-bold">
                        Lý do: Người mua chậm thanh toán quá 24 giờ.
                      </span>
                      Hành động này không thể hoàn tác.
                    </>
                  }
                  confirmLabel="Xác nhận hủy"
                  cancelLabel="Giữ lại đơn hàng"
                  onConfirm={handleCancelOrder}
                  isConfirming={isCancelling}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end gap-3 pt-4">
            <ConfirmationDialog
              trigger={
                <Button variant="default">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Xác nhận đã nhận thanh toán
                </Button>
              }
              variant="success"
              title="Xác nhận thanh toán"
              description="Bạn có chắc chắn đã nhận được thanh toán từ người mua không? Sau khi xác nhận, bạn sẽ cần chuẩn bị hàng và bàn giao trong vòng 24-48 giờ."
              confirmLabel="Xác nhận"
              onConfirm={handleConfirmPayment}
              isConfirming={isConfirming}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerPaymentStep;
