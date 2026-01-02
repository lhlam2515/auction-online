import { UserMinus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

interface KickBidderProps {
  bidderId: string;
  productId: string;
  bidderName?: string;
  onSuccess?: () => void;
}

const KickBidderDialog = ({
  bidderId,
  productId,
  bidderName,
  onSuccess,
}: KickBidderProps) => {
  const [open, setOpen] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [kickReason, setKickReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleKickBidder = async () => {
    if (!bidderId) return;

    // Validate reason
    if (kickReason.trim().length < 10) {
      setReasonError("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    setIsKicking(true);
    try {
      logger.info("Kicking bidder:", {
        bidderId,
        reason: kickReason,
      });

      const response = await api.bids.kickBidder(productId, {
        bidderId,
        reason: kickReason.trim(),
      });

      if (!response.success) {
        throw new Error(
          response.error.message || "Không thể kick người đặt giá"
        );
      }

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
    setOpen(false);
    setKickReason("");
    setReasonError("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận kick người đặt giá</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn kick{" "}
            <span className="font-semibold">
              {bidderName || "người dùng này"}
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
};

export default KickBidderDialog;
