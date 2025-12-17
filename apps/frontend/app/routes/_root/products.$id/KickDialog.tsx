import type { BidWithUser } from "@repo/shared-types";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

interface KickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bidder?: BidWithUser;
  productId: string;
  onSuccess?: () => void;
}

export function KickDialog({
  open,
  onOpenChange,
  bidder,
  productId,
  onSuccess,
}: KickDialogProps) {
  const [isKicking, setIsKicking] = useState(false);
  const [kickReason, setKickReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleKickBidder = async () => {
    if (!bidder) return;

    // Validate reason
    if (kickReason.trim().length < 10) {
      setReasonError("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    setIsKicking(true);
    try {
      logger.info("Kicking bidder:", {
        bidderId: bidder.userId,
        reason: kickReason,
      });
      const response = await api.bids.kickBidder(productId, {
        bidderId: bidder.userId,
        reason: kickReason.trim(),
      });
      toast.success("Đã kick người đặt giá thành công");

      // Reset form and close dialog
      handleClose();

      // Call success callback
      onSuccess?.();
    } catch (err) {
      toast.error("Có lỗi khi kick người đặt giá");
      logger.error("Error kicking bidder:", err);
    } finally {
      setIsKicking(false);
    }
  };

  const handleClose = () => {
    setKickReason("");
    setReasonError("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận kick người đặt giá</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn kick{" "}
            <span className="font-semibold">
              {bidder?.userName || "người dùng này"}
            </span>{" "}
            khỏi phiên đấu giá? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="kickReason" className="text-sm font-medium">
              Lý do kick <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kickReason"
              value={kickReason}
              onChange={(e) => {
                setKickReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder="Nhập lý do kick người đặt giá (tối thiểu 10 ký tự)"
              disabled={isKicking}
              className={reasonError ? "border-red-500" : ""}
            />
            {reasonError && (
              <p className="text-sm text-red-500">{reasonError}</p>
            )}
            <p className="text-xs text-gray-500">
              Đã nhập: {kickReason.length}/10 ký tự tối thiểu
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isKicking}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleKickBidder}
            disabled={isKicking || kickReason.trim().length < 10}
          >
            {isKicking ? "Đang xử lý..." : "Kick"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
