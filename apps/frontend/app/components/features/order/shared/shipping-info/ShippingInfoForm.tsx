import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getErrorMessage, showError } from "@/lib/handlers/error";

interface ShippingInfoFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  onSuccess?: (data: T) => void;
  onCancel?: () => void;
}

const ShippingInfoForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  onCancel,
}: ShippingInfoFormProps<T>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  // Reset form when values change
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

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
      shippingAddress: "Địa chỉ giao hàng",
      phoneNumber: "Số điện thoại",
    };

    return nameMap[fieldName] || fieldName;
  };

  return (
    <form
      id="shipping-info-form"
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
        {Object.keys(defaultValues).map((field) => (
          <Controller
            key={field}
            control={form.control}
            name={field as Path<T>}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel
                  htmlFor={field.name}
                  className="text-base font-semibold"
                >
                  {formatFieldName(field.name)}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  value={field.value || ""}
                  className="border text-base"
                  aria-invalid={fieldState.invalid}
                  autoFocus={field.value === ""}
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </FieldGroup>

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="ml-2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        )}

        <ConfirmationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          triggerLabel="Lưu thay đổi"
          triggerIcon={CheckCircle2}
          onTriggerClick={handleOpenDialog}
          variant="success"
          title="Xác nhận cập nhật thông tin giao hàng"
          description="Bạn có chắc chắn muốn cập nhật thông tin giao hàng không? Thông tin mới sẽ được sử dụng để giao hàng cho đơn hàng này."
          confirmLabel="Xác nhận cập nhật"
          onConfirm={handleConfirmSubmit}
          isConfirming={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ShippingInfoForm;
