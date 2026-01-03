import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminUser, UpdateUserInfoRequest } from "@repo/shared-types";
import { Save } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { updateUserInfoSchema } from "@/lib/validations/admin.validation";

type UpdateUserInfoForm = z.infer<typeof updateUserInfoSchema>;

type UpdateUserInfoFormProps = {
  userId: string;
  user: AdminUser;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const UpdateUserInfoForm = ({
  userId,
  user,
  onSuccess,
  onCancel,
}: UpdateUserInfoFormProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const form = useForm<UpdateUserInfoForm>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      fullName: user.fullName || "",
      address: user.address || "",
      birthDate: user.birthDate
        ? new Date(user.birthDate).toISOString().split("T")[0]
        : "",
    },
  });

  const handleConfirmSubmit = async () => {
    const data = form.getValues();

    try {
      setIsConfirming(true);
      form.clearErrors();

      const updateData: UpdateUserInfoRequest = {
        fullName: data.fullName,
        address: data.address || undefined,
        birthDate: data.birthDate || undefined,
      };

      const response = await api.admin.users.update(userId, updateData);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Lỗi khi cập nhật thông tin"
        );
      }

      toast.success("Cập nhật thông tin người dùng thành công!");
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Lỗi khi cập nhật thông tin người dùng"
      );
      form.setError("root", { message: errorMessage });
      showError(err, errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      {form.formState.errors.root && (
        <AlertSection
          variant="destructive"
          description={form.formState.errors.root.message}
        />
      )}

      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-semibold"
              >
                Họ và tên <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                className="border"
                aria-invalid={fieldState.invalid}
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-semibold"
              >
                Địa chỉ
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                className="border"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="birthDate"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-semibold"
              >
                Ngày sinh
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="date"
                className="border"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <ConfirmationDialog
          trigger={
            <Button
              type="button"
              disabled={!form.formState.isValid || isConfirming}
              className="cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          }
          title="Xác nhận cập nhật thông tin"
          description={
            <div className="space-y-2">
              <p>Bạn có chắc chắn muốn cập nhật thông tin người dùng này?</p>
              <div className="mt-2 space-y-1 rounded-md bg-gray-50 p-3 text-sm">
                <p>
                  <strong>Họ tên:</strong> {form.watch("fullName")}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {form.watch("address") || "(Trống)"}
                </p>
                <p>
                  <strong>Ngày sinh:</strong>{" "}
                  {form.watch("birthDate") || "(Trống)"}
                </p>
              </div>
            </div>
          }
          variant="default"
          confirmLabel="Xác nhận"
          confirmIcon={Save}
          onConfirm={handleConfirmSubmit}
          isConfirming={isConfirming}
        />
      </div>
    </form>
  );
};

export default UpdateUserInfoForm;
