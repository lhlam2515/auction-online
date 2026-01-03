import type { AdminUpgradeRequest } from "@repo/shared-types";
import { ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApproveRequestDialogProps {
  trigger: ReactNode;
  request: AdminUpgradeRequest;
  onConfirm: (reason: string) => Promise<void>;
}

export function ApproveRequestDialog({
  trigger,
  request,
  onConfirm,
}: ApproveRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(reason);
      setOpen(false);
      setReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <DialogTitle>Xác nhận phê duyệt</DialogTitle>
          </div>
          <DialogDescription>
            Bạn có chắc chắn muốn chấp nhận yêu cầu nâng cấp tài khoản của người
            dùng{" "}
            <span className="text-foreground font-semibold">
              {request.userName}
            </span>{" "}
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
            onClick={() => setOpen(false)}
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
