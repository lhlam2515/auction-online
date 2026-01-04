import type { ProductDetails } from "@repo/shared-types";
import { Gavel, AlertTriangleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";

import { AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";

import { AutoBidForm } from "./forms";
import { useAutoBidForm } from "./hooks";

type AutoBidDialogProps = {
  product: ProductDetails;
  userRating: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  disabled?: boolean;
};

const AutoBidDialog = ({
  product,
  userRating,
  trigger,
  onSuccess,
  disabled = false,
}: AutoBidDialogProps) => {
  const [open, setOpen] = useState(false);

  const currentPrice = Number(product.currentPrice ?? product.startPrice);
  const stepPrice = Number(product.stepPrice);
  const minBid = currentPrice + stepPrice;
  const isEligible = product.freeToBid || userRating >= 80;

  const {
    form,
    existingAutoBid,
    isUpdating,
    isLoadingAutoBid,
    fetchAutoBid,
    submitAutoBid,
    resetForm,
  } = useAutoBidForm({
    productId: product.id,
    productName: product.name,
    minRequiredBid: minBid,
    stepPrice,
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  // Fetch existing auto bid when dialog opens
  useEffect(() => {
    if (open) {
      fetchAutoBid();
    }
  }, [open, fetchAutoBid]);

  const minRequiredBid = isUpdating
    ? Math.max(minBid, Number(existingAutoBid?.maxAmount || 0) + stepPrice)
    : minBid;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    try {
      await submitAutoBid();
    } catch {
      // Error already handled in hook
    }
  };

  const isFormValid = form.formState.isValid;

  return (
    <FormProvider {...form}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              size="lg"
              className="flex h-14 flex-1 cursor-pointer items-center gap-2 bg-slate-900 text-lg font-semibold text-white hover:bg-slate-800"
              disabled={disabled}
            >
              <Gavel className="h-4 w-4" />
              Đặt giá
            </Button>
          )}
        </DialogTrigger>
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
            <>
              {/* Eligibility Check - Only for new auto bids */}
              {!isUpdating && !isEligible && (
                <AlertSection
                  variant="destructive"
                  icon={AlertTriangleIcon}
                  description={
                    <>
                      Điểm uy tín của bạn quá thấp để đấu giá sản phẩm này.
                      <br />
                      <span className="text-sm">
                        Điểm hiện tại: {userRating}% - Yêu cầu tối thiểu: 80%
                      </span>
                    </>
                  }
                />
              )}

              {/* Auto Bid Form */}
              {isEligible && (
                <AutoBidForm
                  form={form}
                  productName={product.name}
                  minRequiredBid={minRequiredBid}
                  stepPrice={stepPrice}
                  buyNowPrice={
                    product.buyNowPrice ? Number(product.buyNowPrice) : null
                  }
                  existingAutoBid={existingAutoBid}
                  isUpdating={isUpdating}
                  onCancel={() => setOpen(false)}
                  onSubmit={handleSubmit}
                  isFormValid={isFormValid}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
};

export default AutoBidDialog;
