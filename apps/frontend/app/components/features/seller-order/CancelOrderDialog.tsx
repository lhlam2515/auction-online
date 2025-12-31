import { XCircle } from "lucide-react";

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

interface CancelOrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCancelling: boolean;
  onCancelOrder: () => void;
}

export const CancelOrderDialog = ({
  isOpen,
  onOpenChange,
  isCancelling,
  onCancelOrder,
}: CancelOrderDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={isCancelling}>
          {isCancelling ? (
            <>
              <Spinner className="h-4 w-4" />
              Đang hủy...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              Hủy giao dịch
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hủy giao dịch</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy đơn hàng này không?
            <span className="block font-semibold">
              Lý do: Người mua chậm thanh toán quá 24 giờ.
            </span>
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCancelling}
          >
            Giữ lại đơn hàng
          </Button>
          <Button
            variant="destructive"
            onClick={onCancelOrder}
            disabled={isCancelling}
          >
            Xác nhận hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
