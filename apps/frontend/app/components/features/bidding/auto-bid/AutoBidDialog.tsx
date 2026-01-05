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
import { Spinner } from "@/components/ui/spinner";
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
              className="h-14 flex-1 cursor-pointer text-lg font-semibold"
              disabled={disabled}
            >
              <Gavel className="size-6" />
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
                <span className="text-foreground text-lg font-bold">
                  {formatPrice(currentPrice)}
                </span>
              </div>
              {product.buyNowPrice && (
                <div>
                  Giá mua ngay:{" "}
                  <span className="text-foreground text-lg font-bold">
                    {formatPrice(Number(product.buyNowPrice))}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoadingAutoBid ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-8">
              <Spinner />
              <p>Đang tải thông tin đấu giá...</p>
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
                      Điểm đánh giá của bạn quá thấp để đấu giá sản phẩm này.
                      <br />
                      <span className="text-sm">
                        Điểm hiện tại: <strong>{userRating}%</strong> - Yêu cầu
                        tối thiểu: <strong>80%</strong>
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
                  minRequiredBid={minBid}
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
