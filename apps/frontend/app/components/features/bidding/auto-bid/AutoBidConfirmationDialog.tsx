import type { AutoBid } from "@repo/shared-types";
import { Gavel, AlertTriangleIcon } from "lucide-react";

import { ConfirmationDialog, AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface AutoBidConfirmationDialogProps {
  productName: string;
  bidAmount: number;
  buyNowPrice: number | null;
  existingAutoBid: AutoBid | null;
  isUpdating: boolean;
  isSubmitting: boolean;
  isEligible: boolean;
  isLoadingAutoBid: boolean;
  onConfirm: () => void;
  onTriggerClick: () => void;
}

const AutoBidConfirmationDialog = ({
  productName,
  bidAmount,
  buyNowPrice,
  existingAutoBid,
  isUpdating,
  isSubmitting,
  isEligible,
  isLoadingAutoBid,
  onConfirm,
}: AutoBidConfirmationDialogProps) => {
  return (
    <ConfirmationDialog
      trigger={
        <Button
          variant="default"
          className="cursor-pointer bg-slate-900 hover:bg-slate-800"
          disabled={(!isUpdating && !isEligible) || isLoadingAutoBid}
        >
          <Gavel className="h-4 w-4" />
          {isUpdating
            ? "Cập Nhật Giá"
            : isEligible
              ? "Đặt Giá"
              : "Không Đủ Điều Kiện"}
        </Button>
      }
      title={isUpdating ? "Xác nhận cập nhật giá" : "Xác nhận đặt giá"}
      description={
        isUpdating
          ? "Bạn có chắc chắn muốn cập nhật giá tối đa cho sản phẩm này?"
          : "Bạn có chắc chắn muốn đặt giá cho sản phẩm này?"
      }
      confirmLabel={isUpdating ? "Xác nhận cập nhật" : "Xác nhận đặt giá"}
      onConfirm={onConfirm}
      isConfirming={isSubmitting}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Sản phẩm:</p>
          <p className="font-semibold text-slate-900">{productName}</p>

          {isUpdating && existingAutoBid && (
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
            {isUpdating ? "Giá tối đa mới:" : "Giá đặt tối đa:"}
          </p>
          <p className="text-lg font-bold text-slate-900">
            {formatPrice(bidAmount)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            * Hệ thống sẽ tự động đấu giá cho bạn đến mức giá này
          </p>
        </div>

        {/* Buy Now Warning */}
        {buyNowPrice && bidAmount >= buyNowPrice && (
          <AlertSection
            variant="warning"
            icon={AlertTriangleIcon}
            title="Lưu ý:"
            description={
              <>
                Giá đặt của bạn đã đạt hoặc vượt giá mua ngay (
                {formatPrice(buyNowPrice)}).
                <br />
                Khi hệ thống tự động đấu giá đạt mức giá mua ngay, sản phẩm sẽ
                được <strong>mua ngay tự động</strong> và cuộc đấu giá sẽ kết
                thúc.
              </>
            }
          />
        )}
      </div>
    </ConfirmationDialog>
  );
};

export default AutoBidConfirmationDialog;
