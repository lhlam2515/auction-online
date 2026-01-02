import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

interface SellerConfirmPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isConfirming: boolean;
  onConfirmPayment: () => void;
}

export const SellerConfirmPaymentDialog = ({
  isOpen,
  onOpenChange,
  isConfirming,
  onConfirmPayment,
}: SellerConfirmPaymentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-emerald-500 text-white hover:bg-emerald-700"
          disabled={isConfirming}
        >
          {isConfirming ? (
            <>
              <Spinner className="h-4 w-4" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận đã nhận thanh toán
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận thanh toán</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn đã nhận được thanh toán từ người mua không? Sau khi
            xác nhận, bạn sẽ cần chuẩn bị hàng và bàn giao trong vòng 24-48 giờ.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Hủy
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-700"
            onClick={onConfirmPayment}
            disabled={isConfirming}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
