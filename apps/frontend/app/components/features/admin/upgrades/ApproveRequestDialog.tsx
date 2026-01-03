import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApproveRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  userName?: string;
}

export function ApproveRequestDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isProcessing,
  userName,
}: ApproveRequestDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận phê duyệt</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn chấp nhận yêu cầu nâng cấp tài khoản của người
            dùng{" "}
            <span className="text-foreground font-semibold">{userName}</span>{" "}
            lên Seller không? Hành động này sẽ cấp quyền đăng bán sản phẩm cho
            người dùng.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Hủy bỏ
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
