import type { AutoBid } from "@repo/shared-types";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

interface AutoBidFormProps {
  minRequiredBid: number;
  existingAutoBid?: AutoBid | null;
  isUpdateAutoBid?: boolean;
}

// Create dynamic schema based on minRequiredBid and stepPrice
export const createBidSchema = (minRequiredBid: number, stepPrice: number) =>
  z.object({
    maxBid: z
      .string()
      .min(1, "Vui lòng nhập số tiền hợp lệ")
      .refine((val) => {
        const bidAmount = Number.parseInt(val.replace(/\D/g, ""));
        return !isNaN(bidAmount) && bidAmount > 0;
      }, "Vui lòng nhập số tiền hợp lệ")
      .refine(
        (val) => {
          const bidAmount = Number.parseInt(val.replace(/\D/g, ""));
          return bidAmount >= minRequiredBid;
        },
        `Giá đặt phải từ ${formatPrice(minRequiredBid)} trở lên`
      )
      .refine(
        (val) => {
          const bidAmount = Number.parseInt(val.replace(/\D/g, ""));
          return bidAmount % stepPrice === 0;
        },
        `Giá đặt phải là bội số của bước giá (${formatPrice(stepPrice)})`
      ),
  });
export type CreateBidFormData = z.infer<ReturnType<typeof createBidSchema>>;

const AutoBidForm = ({
  minRequiredBid,
  existingAutoBid,
  isUpdateAutoBid = false,
}: AutoBidFormProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

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

  return (
    <form
      id="auto-bid-form"
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4"
      noValidate
    >
      {errors.root && (
        <div className="error-message">
          <p>{errors.root.message}</p>
        </div>
      )}
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
                {isUpdateAutoBid
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
                {isUpdateAutoBid
                  ? "Cập nhật giá tối đa mới cho đấu giá tự động."
                  : "Hệ thống sẽ tự động đấu giá cho bạn lên đến mức này."}{" "}
                Giá tối thiểu: <strong>{formatPrice(minRequiredBid)}</strong>
                {isUpdateAutoBid && existingAutoBid && (
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
    </form>
  );
};

export default AutoBidForm;
