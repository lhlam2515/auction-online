import type { OrderWithDetails, PaymentMethod } from "@repo/shared-types";
import { CreditCard } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-layer";

import PaymentMethodOption from "../shared/PaymentMethodOption";
import ShippingInfo from "../shared/shipping-info";

interface BuyerPaymentStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const BuyerPaymentStep = ({ order, onSuccess }: BuyerPaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("BANK_TRANSFER");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    try {
      const response = await api.orders.markPaid(order.id, {
        paymentMethod: paymentMethod,
        transactionId: `TXN-${Date.now()}`,
        amount: order.totalAmount,
      });

      if (!response.success) {
        throw new Error(
          response.error.message || "Không thể xác nhận thanh toán"
        );
      }

      toast.success("Xác nhận thanh toán thành công");

      // Refresh order data
      const { order: updatedOrder, payment } = response.data;
      onSuccess?.({ ...order, ...updatedOrder, payment } as OrderWithDetails);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi xác nhận thanh toán"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    setIsPaymentDialogOpen(false);
    handleProcessPayment();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin thanh toán</CardTitle>
        <CardDescription>
          Vui lòng hoàn tất thanh toán để người bán xác nhận đơn hàng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AlertSection
          variant="info"
          icon={CreditCard}
          description="Sau khi thanh toán, người bán sẽ xác nhận và gửi hàng trong vòng 24-48 giờ."
        />

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Phương thức thanh toán
          </Label>
          <div className="space-y-2">
            <PaymentMethodOption
              title="Chuyển khoản ngân hàng"
              description="Chuyển trực tiếp qua tài khoản ngân hàng"
              selected={paymentMethod === "BANK_TRANSFER"}
              onSelect={() => setPaymentMethod("BANK_TRANSFER")}
            />

            <PaymentMethodOption
              title="Ví điện tử"
              description="MoMo, ZaloPay, VNPay"
              selected={paymentMethod === "EWALLET"}
              onSelect={() => setPaymentMethod("EWALLET")}
            />

            <PaymentMethodOption
              title="Thẻ tín dụng/ghi nợ"
              description="Visa, Mastercard, JCB"
              selected={paymentMethod === "CREDIT_CARD"}
              onSelect={() => setPaymentMethod("CREDIT_CARD")}
            />
          </div>
        </div>

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={order.shippingAddress || order.winner.address}
          phoneNumber={order.phoneNumber || ""}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <ConfirmationDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            triggerLabel="Xác nhận thanh toán"
            triggerIcon={CreditCard}
            variant="success"
            title="Xác nhận thanh toán"
            description="Bạn có chắc muốn xác nhận thanh toán cho đơn hàng này không? Sau khi xác nhận, bạn không thể thay đổi phương thức thanh toán."
            confirmLabel="Xác nhận thanh toán"
            onConfirm={handleConfirmPayment}
            isConfirming={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerPaymentStep;
