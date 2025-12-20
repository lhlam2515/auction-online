import type { ProductDetails, AutoBid } from "@repo/shared-types";
import { InfoIcon, AlertTriangleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { formatPrice } from "@/lib/utils";

interface BiddingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetails;
  userRating: number;
}

export function BiddingDialog({
  open,
  onOpenChange,
  product,
  userRating,
}: BiddingDialogProps) {
  const currentPrice = Number(product.currentPrice ?? product.startPrice);
  const stepPrice = Number(product.stepPrice);
  const buyNowPrice = product.buyNowPrice ? Number(product.buyNowPrice) : null;

  const [maxBid, setMaxBid] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAutoBid, setExistingAutoBid] = useState<AutoBid | null>(null);
  const [isLoadingAutoBid, setIsLoadingAutoBid] = useState(false);

  const minBid = currentPrice + stepPrice;
  const isEligible = product.freeToBid || userRating >= 80;
  const isUpdatingAutoBid = existingAutoBid !== null;
  const minRequiredBid = isUpdatingAutoBid
    ? Math.max(minBid, Number(existingAutoBid.maxAmount) + stepPrice)
    : minBid;

  // Fetch existing auto bid when dialog opens
  useEffect(() => {
    const fetchAutoBid = async () => {
      if (!open) return;

      setIsLoadingAutoBid(true);
      try {
        const response = await api.bids.getAutoBid(product.id);
        if (response.success && response.data) {
          setExistingAutoBid(response.data);
        } else {
          setExistingAutoBid(null);
        }
      } catch (error) {
        // No existing auto bid, which is fine
        setExistingAutoBid(null);
      } finally {
        setIsLoadingAutoBid(false);
      }
    };

    fetchAutoBid();
  }, [open, product.id]);

  const handleBidSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const bidAmount = Number.parseInt(maxBid.replace(/\D/g, ""));

      let response;
      if (isUpdatingAutoBid) {
        // Update existing auto bid
        response = await api.bids.updateAutoBid(existingAutoBid.id, {
          maxAmount: bidAmount,
        });
      } else {
        // Create new auto bid
        response = await api.bids.createAutoBid(product.id, {
          maxAmount: bidAmount,
        });
      }

      if (!response.success) {
        setError("Có lỗi khi đặt giá. Vui lòng thử lại.");
        toast.error(
          isUpdatingAutoBid ? "Cập nhật giá thất bại" : "Đặt giá thất bại",
          {
            description: "Có lỗi xảy ra khi đặt giá. Vui lòng thử lại.",
          }
        );
        return;
      }

      // Show success toast
      toast.success(
        isUpdatingAutoBid ? "Cập nhật giá thành công!" : "Đặt giá thành công!",
        {
          description: `Bạn đã ${isUpdatingAutoBid ? "cập nhật" : "đặt"} giá tối đa ${formatPrice(bidAmount)} cho sản phẩm "${product.name}".`,
        }
      );

      // Close dialog and reset form
      setShowConfirmDialog(false);
      setMaxBid("");
      onOpenChange(false);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error(
        isUpdatingAutoBid ? "Cập nhật giá thất bại" : "Đặt giá thất bại",
        {
          description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        }
      );
      setError("Có lỗi khi đặt giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreSubmitValidation = () => {
    setError("");

    const bidAmount = Number.parseInt(maxBid.replace(/\D/g, ""));

    if (!bidAmount || isNaN(bidAmount)) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (bidAmount < minRequiredBid) {
      setError(`Giá đặt phải từ ${formatPrice(minRequiredBid)} trở lên`);
      return;
    }

    if (bidAmount % stepPrice !== 0) {
      setError(
        `Giá đặt phải là bội số của bước giá (${formatPrice(stepPrice)})`
      );
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleMaxBidChange = (value: string) => {
    // Allow only numbers and format with dots
    const numbers = value.replace(/\D/g, "");
    if (numbers) {
      const formatted = Number.parseInt(numbers).toLocaleString("vi-VN");
      setMaxBid(formatted);
    } else {
      setMaxBid("");
    }
    setError("");
  };

  const handleClose = () => {
    setShowConfirmDialog(false);
    setMaxBid("");
    setError("");
    setExistingAutoBid(null);
    onOpenChange(false);
  };

  return (
    <>
      {/* Main Bidding Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">{product.name}</DialogTitle>
            <DialogDescription className="text-base">
              <div>
                Giá hiện tại:{" "}
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(currentPrice)}
                </span>
              </div>
              {product.buyNowPrice && (
                <div>
                  Giá mua ngay:{" "}
                  <span className="text-lg font-bold text-slate-900">
                    {formatPrice(Number(product.buyNowPrice))}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoadingAutoBid ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-slate-600">
                Đang tải thông tin đấu giá...
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Existing Auto Bid Information */}
              {existingAutoBid && (
                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription className="text-yellow-800">
                    Bạn đã có đấu giá tự động với giá tối đa:{" "}
                    <strong>
                      {formatPrice(Number(existingAutoBid.maxAmount))}
                    </strong>
                    <span className="text-sm">
                      Cập nhật giá tối đa mới để thay đổi.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Price Information */}
              <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  Bước giá: <strong>{formatPrice(stepPrice)}</strong>
                </AlertDescription>
              </Alert>

              {/* Eligibility Check (BR-B01) - Only for new auto bids */}
              {!isUpdatingAutoBid && !isEligible && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Điểm uy tín của bạn quá thấp để đấu giá sản phẩm này.
                    <br />
                    <span className="text-sm">
                      Điểm hiện tại: {userRating}% - Yêu cầu tối thiểu: 80%
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Proxy Bidding Input (BR-B03) */}
              <div className="space-y-2">
                <Label htmlFor="maxBid" className="text-base font-semibold">
                  {isUpdatingAutoBid
                    ? "Giá Đặt Tối Đa Mới (Bí Mật)"
                    : "Giá Đặt Tối Đa Của Bạn (Bí Mật)"}
                </Label>
                <Input
                  id="maxBid"
                  type="text"
                  placeholder={formatPrice(minRequiredBid)}
                  value={maxBid}
                  onChange={(e) => handleMaxBidChange(e.target.value)}
                  disabled={!isUpdatingAutoBid && !isEligible}
                  className="text-lg font-semibold"
                />
                <p className="text-muted-foreground text-sm">
                  {isUpdatingAutoBid
                    ? "Cập nhật giá tối đa mới cho đấu giá tự động."
                    : "Hệ thống sẽ tự động đấu giá cho bạn lên đến mức này."}
                </p>
                <p className="text-xs text-slate-600">
                  Giá tối thiểu: <strong>{formatPrice(minRequiredBid)}</strong>
                  {isUpdatingAutoBid && (
                    <span className="ml-2">
                      (Giá cũ: {formatPrice(Number(existingAutoBid.maxAmount))})
                    </span>
                  )}
                </p>
              </div>

              {/* Validation Error */}
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handlePreSubmitValidation}
              disabled={(!isUpdatingAutoBid && !isEligible) || isLoadingAutoBid}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isUpdatingAutoBid
                ? "Cập Nhật Giá"
                : isEligible
                  ? "Đặt Giá"
                  : "Không Đủ Điều Kiện"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {isUpdatingAutoBid ? "Xác nhận cập nhật giá" : "Xác nhận đặt giá"}
            </DialogTitle>
            <DialogDescription>
              {isUpdatingAutoBid
                ? "Bạn có chắc chắn muốn cập nhật giá tối đa cho sản phẩm này?"
                : "Bạn có chắc chắn muốn đặt giá cho sản phẩm này?"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Sản phẩm:</p>
              <p className="font-semibold text-slate-900">{product.name}</p>

              {isUpdatingAutoBid && existingAutoBid && (
                <>
                  <p className="mt-3 text-sm text-slate-600">
                    Giá tối đa hiện tại:
                  </p>
                  <p className="text-base font-semibold text-slate-700">
                    {formatPrice(Number(existingAutoBid.maxAmount))}
                  </p>
                </>
              )}

              <p className="mt-3 text-sm text-slate-600">
                {isUpdatingAutoBid ? "Giá tối đa mới:" : "Giá đặt tối đa:"}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatPrice(Number.parseInt(maxBid.replace(/\D/g, "")))}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                * Hệ thống sẽ tự động đấu giá cho bạn đến mức giá này
              </p>
            </div>

            {/* Buy Now Warning */}
            {buyNowPrice &&
              Number.parseInt(maxBid.replace(/\D/g, "")) >= buyNowPrice && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription className="text-orange-800">
                    <strong>Lưu ý:</strong>
                    <span>
                      Giá đặt của bạn đã đạt hoặc vượt giá mua ngay (
                      {formatPrice(buyNowPrice)}).
                      <br />
                      Khi hệ thống tự động đấu giá đạt mức giá mua ngay, sản
                      phẩm sẽ được <strong>mua ngay tự động</strong> và cuộc đấu
                      giá sẽ kết thúc.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBidSubmit}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isLoading
                ? "Đang xử lý..."
                : isUpdatingAutoBid
                  ? "Xác nhận cập nhật"
                  : "Xác nhận đặt giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
