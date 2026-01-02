import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import { Truck } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage, showError } from "@/lib/handlers/error";

interface ShippingFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  onSuccess?: (data: T) => void;
}

const SHIPPING_PROVIDERS = [
  { value: "VNPOST", label: "Bưu điện Việt Nam" },
  { value: "GHN", label: "Giao Hàng Nhanh (GHN)" },
  { value: "GHTK", label: "Giao Hàng Tiết Kiệm" },
  { value: "JNT", label: "JNT Express" },
];

const DeliveryInfoForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
}: ShippingFormProps<T>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleConfirmSubmit = async () => {
    const data = form.getValues();

    try {
      setIsDialogOpen(false);
      setIsSubmitting(true);
      form.clearErrors();

      const result = (await onSubmit(data)) as ApiResponse;

      if (!result.success) {
        toast.error(
          result.error?.message || "Lỗi khi cập nhật thông tin giao hàng"
        );
        setIsDialogOpen(false);
        return;
      }

      toast.success("Cập nhật thông tin giao hàng thành công");
      onSuccess?.(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      form.setError("root", { message: errorMessage });

      showError(error, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsDialogOpen(true);
    }
  };

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      shippingProvider: "Nhà vận chuyển",
      trackingNumber: "Mã vận đơn",
    };

    return nameMap[fieldName] || fieldName;
  };

  return (
    <form
      id="shipping-form"
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4"
      noValidate
    >
      {form.formState.errors.root && (
        <div className="error-message">
          <p>{form.formState.errors.root.message}</p>
        </div>
      )}
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name={"shippingProvider" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor="shippingProvider"
                className="text-base font-semibold"
              >
                {formatFieldName(field.name)}
              </FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="shippingProvider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name={"trackingNumber" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor="trackingNumber"
                className="text-base font-semibold"
              >
                {formatFieldName(field.name)} *
              </FieldLabel>
              <Input
                {...field}
                id="trackingNumber"
                type="text"
                placeholder="VD: 123456789"
                className="border text-base"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                required
              />
              <FieldDescription>
                Nhập mã vận đơn từ nhà vận chuyển của bạn
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-3 pt-4">
        <ConfirmationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          triggerLabel="Xác nhận bàn giao hàng"
          triggerIcon={Truck}
          onTriggerClick={handleOpenDialog}
          title="Xác nhận bàn giao hàng"
          description={
            <>
              Bạn có chắc chắn đã gửi hàng với mã vận đơn{" "}
              <span className="font-mono font-bold">
                {form.getValues().trackingNumber}
              </span>{" "}
              không? Sau khi xác nhận, bạn sẽ không thể thay đổi thông tin vận
              chuyển.
            </>
          }
          confirmLabel="Xác nhận bàn giao"
          onConfirm={handleConfirmSubmit}
          isConfirming={isSubmitting}
        />
      </div>
    </form>
  );
};

export default DeliveryInfoForm;
