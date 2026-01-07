import type { OrderWithDetails, PaymentMethod } from "@repo/shared-types";
import { CreditCard } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";

import {
  PaymentMethodOption,
  PaymentProofUpload,
  ShippingInfo,
} from "../shared";

interface BuyerPaymentStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const BuyerPaymentStep = ({ order, onSuccess }: BuyerPaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("BANK_TRANSFER");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const handleProcessPayment = async () => {
    if (!paymentProofFile) {
      toast.error("Vui lòng tải lên ảnh minh chứng thanh toán");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      formData.append("amount", order.totalAmount);
      formData.append("transactionId", `TXN-${Date.now()}`);
      formData.append("paymentProof", paymentProofFile);

      const response = await api.orders.markPaid(order.id, formData);

      if (!response.success) {
        throw new Error(
          response.error.message || "Không thể xác nhận thanh toán"
        );
      }

      toast.success("Tải lên ảnh minh chứng thanh toán thành công");

      // Refresh order data
      const { order: updatedOrder, payment } = response.data;
      onSuccess?.({ ...order, ...updatedOrder, payment } as OrderWithDetails);
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Lỗi tải lên ảnh minh chứng thanh toán"
      );
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
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
          description="Sau khi tải lên ảnh minh chứng, người bán sẽ kiểm tra và xác nhận thanh toán. Đơn hàng sẽ được gửi trong vòng 24-48 giờ sau khi xác nhận."
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

        {/* Payment Proof Upload */}
        <PaymentProofUpload
          onFileSelect={setPaymentProofFile}
          selectedFile={paymentProofFile}
          isUploading={isProcessing}
        />

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={
            order.shippingAddress ||
            order.winner?.address ||
            "Địa chỉ không khả dụng"
          }
          phoneNumber={order.phoneNumber || ""}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <ConfirmationDialog
            trigger={
              <Button variant="default" disabled={!paymentProofFile}>
                <CreditCard className="h-4 w-4" />
                Tải ảnh minh chứng thanh toán
              </Button>
            }
            variant="success"
            title="Xác nhận ảnh minh chứng"
            description="Bạn có chắc muốn tải lên ảnh minh chứng thanh toán này không? Người bán sẽ kiểm tra và xác nhận thanh toán dựa trên ảnh này."
            confirmLabel="Tải ảnh minh chứng"
            onConfirm={handleConfirmPayment}
            isConfirming={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerPaymentStep;
