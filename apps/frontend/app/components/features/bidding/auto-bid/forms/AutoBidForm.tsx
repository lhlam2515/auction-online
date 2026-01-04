import type { AutoBid } from "@repo/shared-types";
import { InfoIcon, AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

import type { AutoBidFormData } from "../hooks";

type AutoBidFormProps = {
  form: UseFormReturn<AutoBidFormData>;
  productName: string;
  minRequiredBid: number;
  stepPrice: number;
  buyNowPrice: number | null;
  existingAutoBid: AutoBid | null;
  isUpdating: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  isFormValid: boolean;
};

const AutoBidForm = ({
  form,
  productName,
  minRequiredBid,
  stepPrice,
  buyNowPrice,
  existingAutoBid,
  isUpdating,
  onCancel,
  onSubmit,
  isFormValid,
}: AutoBidFormProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { control, formState, watch } = form;

  const maxBid = watch("maxBid");
  const bidAmount = maxBid ? Number.parseInt(maxBid.replace(/\D/g, "")) : 0;

  const handleMaxBidChange = (
    value: string,
    onChange: (val: string) => void
  ) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers) {
      const formatted = Number.parseInt(numbers).toLocaleString("vi-VN");
      onChange(formatted);
    } else {
      onChange("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsConfirming(true);
      await onSubmit();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      {formState.errors.root && (
        <AlertSection
          variant="destructive"
          description={formState.errors.root.message}
        />
      )}

      {/* Existing Auto Bid Information */}
      {existingAutoBid && (
        <AlertSection
          variant="warning"
          icon={InfoIcon}
          description={
            <>
              Bạn đã có đấu giá tự động với giá tối đa:{" "}
              <strong>{formatPrice(Number(existingAutoBid.maxAmount))}</strong>
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

      <FieldGroup className="gap-4">
        <Controller
          control={control}
          name="maxBid"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel htmlFor="maxBid" className="text-base font-semibold">
                {isUpdating
                  ? "Giá Đặt Tối Đa Mới (Bí Mật)"
                  : "Giá Đặt Tối Đa Của Bạn (Bí Mật)"}
              </FieldLabel>
              <Input
                {...field}
                id="maxBid"
                type="text"
                placeholder={formatPrice(minRequiredBid)}
                onChange={(e) =>
                  handleMaxBidChange(e.target.value, field.onChange)
                }
                className="text-lg font-semibold"
                aria-invalid={fieldState.invalid}
                required
              />
              <FieldDescription>
                {isUpdating
                  ? "Cập nhật giá tối đa mới cho đấu giá tự động."
                  : "Hệ thống sẽ tự động đấu giá cho bạn lên đến mức này."}{" "}
                Giá tối thiểu: <strong>{formatPrice(minRequiredBid)}</strong>
                {isUpdating && existingAutoBid && (
                  <span>
                    {" "}
                    (Giá cũ: {formatPrice(Number(existingAutoBid.maxAmount))})
                  </span>
                )}
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Action Buttons with Confirmation Dialog */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isConfirming}
        >
          Hủy
        </Button>

        <ConfirmationDialog
          trigger={
            <Button
              type="button"
              variant="default"
              disabled={!isFormValid || isConfirming}
            >
              {isUpdating ? "Cập Nhật Giá" : "Đặt Giá"}
            </Button>
          }
          title={isUpdating ? "Xác nhận cập nhật giá" : "Xác nhận đặt giá"}
          description={
            isUpdating
              ? "Bạn có chắc chắn muốn cập nhật giá tối đa cho sản phẩm này?"
              : "Bạn có chắc chắn muốn đặt giá cho sản phẩm này?"
          }
          confirmLabel={isUpdating ? "Xác nhận cập nhật" : "Xác nhận đặt giá"}
          onConfirm={handleConfirmSubmit}
          isConfirming={isConfirming}
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
                    Khi hệ thống tự động đấu giá đạt mức giá mua ngay, sản phẩm
                    sẽ được <strong>mua ngay tự động</strong> và cuộc đấu giá sẽ
                    kết thúc.
                  </>
                }
              />
            )}
          </div>
        </ConfirmationDialog>
      </div>
    </form>
  );
};

export default AutoBidForm;
