import type { OrderWithDetails, PaymentMethod } from "@repo/shared-types";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
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
        <Alert className="border-blue-300 bg-blue-50 text-blue-600">
          <CreditCard />
          <AlertTitle>
            Sau khi thanh toán, người bán sẽ xác nhận và gửi hàng trong vòng
            24-48 giờ.
          </AlertTitle>
        </Alert>

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
          <Dialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-emerald-500 text-white hover:bg-emerald-700"
                disabled={isProcessing}
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận thanh toán</DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn xác nhận thanh toán cho đơn hàng này không?
                  Sau khi xác nhận, bạn không thể thay đổi phương thức thanh
                  toán.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-emerald-500 text-white hover:bg-emerald-700"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    "Xác nhận thanh toán"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerPaymentStep;
