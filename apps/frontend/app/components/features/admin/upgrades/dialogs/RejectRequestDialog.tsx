import type { AdminUpgradeRequest } from "@repo/shared-types";
import { ShieldAlert } from "lucide-react";
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

interface RejectRequestDialogProps {
  trigger: ReactNode;
  request: AdminUpgradeRequest;
  onConfirm: (reason: string) => Promise<void>;
}

export function RejectRequestDialog({
  trigger,
  request,
  onConfirm,
}: RejectRequestDialogProps) {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Từ chối yêu cầu nâng cấp
          </DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối yêu cầu của{" "}
            <span className="font-bold">{request.userName}</span>. Người dùng sẽ
            nhận được thông báo về lý do từ chối.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Lý do từ chối</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do..."
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
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            {isProcessing ? "Đang xử lý..." : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
