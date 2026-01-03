import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApproveRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
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
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

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
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="approve-reason">Ghi chú phê duyệt (tùy chọn)</Label>
            <Textarea
              id="approve-reason"
              placeholder="Nhập ghi chú..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Hủy bỏ
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
