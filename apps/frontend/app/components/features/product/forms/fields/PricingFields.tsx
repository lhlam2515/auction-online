import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface PricingFieldsProps<T extends FieldValues> {
  control: Control<T>;
}

const PricingFields = <T extends FieldValues>({
  control,
}: PricingFieldsProps<T>) => {
  return (
    <FieldGroup className="gap-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Controller
          control={control}
          name={"startPrice" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Giá khởi điểm (VND) <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="1.000"
                value={
                  field.value
                    ? (field.value as number).toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, "");
                  field.onChange(numbers ? Number.parseInt(numbers) : 0);
                }}
                className="min-h-12 border text-base font-semibold"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name={"stepPrice" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Bước giá (VND) <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="1.000"
                value={
                  field.value
                    ? (field.value as number).toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, "");
                  field.onChange(numbers ? Number.parseInt(numbers) : 0);
                }}
                className="min-h-12 border text-base font-semibold"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name={"buyNowPrice" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Giá mua ngay (VND)
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="Không bắt buộc"
                value={
                  field.value
                    ? (field.value as number).toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, "");
                  field.onChange(
                    numbers ? Number.parseInt(numbers) : undefined
                  );
                }}
                className="min-h-12 border text-base font-semibold"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Người mua có thể mua ngay với giá này
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        control={control}
        name={"freeToBid" as Path<T>}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="flex w-full flex-col gap-2"
          >
            <div className="flex flex-row items-start space-y-0 space-x-3 rounded-md bg-blue-50 p-4">
              <Checkbox
                id={field.name}
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
                className="mt-1 cursor-pointer"
              />
              <div className="space-y-1 leading-none">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-base font-medium"
                >
                  Đấu giá tự do
                </FieldLabel>
                <FieldDescription>
                  Cho phép người dùng có điểm đánh giá dưới 80% vẫn có thể tham
                  gia đấu giá
                </FieldDescription>
              </div>
            </div>
          </Field>
        )}
      />
    </FieldGroup>
  );
};

export default PricingFields;
