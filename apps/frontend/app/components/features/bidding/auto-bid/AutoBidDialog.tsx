import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductDetails, AutoBid } from "@repo/shared-types";
import { InfoIcon, AlertTriangleIcon, Gavel } from "lucide-react";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import AlertSection from "@/components/common/feedback/AlertSection";
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
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { formatPrice } from "@/lib/utils";

import AutoBidConfirmationDialog from "./AutoBidConfirmationDialog";
import AutoBidForm, {
  createBidSchema,
  type CreateBidFormData,
} from "./AutoBidForm";

interface AutoBidDialogProps {
  product: ProductDetails;
  userRating: number;
  disabled?: boolean;
}

export function AutoBidDialog({
  product,
  userRating,
  disabled = false,
}: AutoBidDialogProps) {
  const [open, setOpen] = useState(false);
  const [existingAutoBid, setExistingAutoBid] = useState<AutoBid | null>(null);
  const [isLoadingAutoBid, setIsLoadingAutoBid] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = Number(product.currentPrice ?? product.startPrice);
  const stepPrice = Number(product.stepPrice);
  const minBid = currentPrice + stepPrice;
  const isEligible = product.freeToBid || userRating >= 80;
  const isUpdatingAutoBid = existingAutoBid !== null;
  const minRequiredBid = isUpdatingAutoBid
    ? Math.max(minBid, Number(existingAutoBid.maxAmount) + stepPrice)
    : minBid;

  const form = useForm<CreateBidFormData>({
    resolver: zodResolver(createBidSchema(minRequiredBid, stepPrice)),
    defaultValues: {
      maxBid: "",
    },
  });

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
      } catch {
        setExistingAutoBid(null);
      } finally {
        setIsLoadingAutoBid(false);
      }
    };

    fetchAutoBid();
  }, [open, product.id]);

  const handleConfirmSubmit = async () => {
    const { maxBid } = form.getValues();

    try {
      setIsConfirmDialogOpen(false);
      setIsSubmitting(true);
      form.clearErrors();

      let response;
      const bidAmount = Number.parseInt(maxBid.replace(/\D/g, ""));
      if (isUpdatingAutoBid) {
        response = await api.bids.updateAutoBid(existingAutoBid.id, {
          maxAmount: bidAmount,
        });
      } else {
        response = await api.bids.createAutoBid(product.id, {
          maxAmount: bidAmount,
        });
      }

      if (!response.success) {
        throw new Error(
          response.error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        );
      }

      toast.success(
        isUpdatingAutoBid ? "Cập nhật giá thành công!" : "Đặt giá thành công!",
        {
          description: `Bạn đã ${isUpdatingAutoBid ? "cập nhật" : "đặt"} giá tối đa ${formatPrice(bidAmount)} cho sản phẩm "${product.name}".`,
        }
      );
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        isUpdatingAutoBid
          ? "Có lỗi xảy ra khi cập nhật giá đấu tự động"
          : "Có lỗi xảy ra khi đặt giá đấu tự động"
      );

      form.setError("root", { message: errorMessage });

      showError(error, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsConfirmDialogOpen(true);
    }
  };

  const handleClose = () => {
    setExistingAutoBid(null);
    setOpen(false);
    form.reset();
  };

  return (
    <FormProvider {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="flex h-14 flex-1 cursor-pointer items-center gap-2 bg-slate-900 text-lg font-semibold text-white hover:bg-slate-800"
            disabled={disabled}
          >
            <Gavel className="h-4 w-4" />
            Đặt giá
          </Button>
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
            <div className="space-y-4 py-4">
              {/* Existing Auto Bid Information */}
              {existingAutoBid && (
                <AlertSection
                  variant="warning"
                  icon={InfoIcon}
                  description={
                    <>
                      Bạn đã có đấu giá tự động với giá tối đa:{" "}
                      <strong>
                        {formatPrice(Number(existingAutoBid.maxAmount))}
                      </strong>
                      <br />
                      <span className="text-sm">
                        Cập nhật giá tối đa mới để thay đổi.
                      </span>
                    </>
                  }
                />
              )}

              {/* Step Price Information */}
              <AlertSection
                variant="info"
                icon={InfoIcon}
                description={
                  <>
                    Bước giá: <strong>{formatPrice(stepPrice)}</strong>
                  </>
                }
              />

              {/* Eligibility Check - Only for new auto bids */}
              {!isUpdatingAutoBid && !isEligible && (
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
                  minRequiredBid={minRequiredBid}
                  existingAutoBid={existingAutoBid}
                  isUpdateAutoBid={isUpdatingAutoBid}
                />
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            {isEligible && (
              <AutoBidConfirmationDialog
                open={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
                productName={product.name}
                bidAmount={
                  form.watch("maxBid")
                    ? Number.parseInt(form.watch("maxBid").replace(/\D/g, ""))
                    : 0
                }
                buyNowPrice={
                  product.buyNowPrice ? Number(product.buyNowPrice) : null
                }
                existingAutoBid={existingAutoBid}
                isUpdating={isUpdatingAutoBid}
                isSubmitting={isSubmitting}
                isEligible={isEligible}
                isLoadingAutoBid={isLoadingAutoBid}
                onConfirm={handleConfirmSubmit}
                onTriggerClick={handleOpenDialog}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}

export default AutoBidDialog;
