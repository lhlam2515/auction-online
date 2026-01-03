import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminUser, UpdateAccountStatusRequest } from "@repo/shared-types";
import { AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AccountStatusBadge } from "@/components/common/badges";
import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { updateAccountStatusSchema } from "@/lib/validations/admin.validation";

type UpdateAccountStatusForm = z.infer<typeof updateAccountStatusSchema>;

type UpdateAccountStatusFormProps = {
  userId: string;
  user: AdminUser;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const UpdateAccountStatusForm = ({
  userId,
  user,
  onSuccess,
  onCancel,
}: UpdateAccountStatusFormProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const form = useForm<UpdateAccountStatusForm>({
    resolver: zodResolver(updateAccountStatusSchema),
    defaultValues: {
      accountStatus: user.accountStatus || "ACTIVE",
    },
  });

  const handleConfirmSubmit = async () => {
    const data = form.getValues();

    try {
      setIsConfirming(true);
      form.clearErrors();

      const updateData: UpdateAccountStatusRequest = {
        accountStatus: data.accountStatus,
      };

      const response = await api.admin.users.updateStatus(userId, updateData);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Lỗi khi cập nhật trạng thái"
        );
      }

      toast.success("Cập nhật trạng thái tài khoản thành công!");
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Lỗi khi cập nhật trạng thái tài khoản"
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Trạng thái hiện tại</label>
        <div>
          <AccountStatusBadge status={user.accountStatus} />
        </div>
      </div>

      <Controller
        control={form.control}
        name="accountStatus"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="flex w-full flex-col gap-2"
          >
            <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
              Trạng thái tài khoản <span className="text-red-500">*</span>
            </FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id={field.name}
                className="border"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING_VERIFICATION">
                  Chờ xác thực
                </SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="BANNED">Bị cấm</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {form.watch("accountStatus") === "BANNED" && (
        <AlertSection
          variant="destructive"
          icon={AlertTriangle}
          title="Cảnh báo"
          description="Người dùng sẽ không thể đăng nhập, đấu giá hoặc sử dụng bất kỳ chức năng nào trên hệ thống."
        />
      )}

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
              variant={
                form.watch("accountStatus") === "BANNED"
                  ? "destructive"
                  : "default"
              }
            >
              <Shield className="h-4 w-4" />
              Cập nhật trạng thái
            </Button>
          }
          title={
            form.watch("accountStatus") === "BANNED"
              ? "Xác nhận cấm tài khoản"
              : "Xác nhận cập nhật trạng thái"
          }
          description={
            <div className="space-y-3">
              <p>
                {form.watch("accountStatus") === "BANNED"
                  ? "Bạn có chắc chắn muốn CẤM tài khoản này?"
                  : "Bạn có chắc chắn muốn cập nhật trạng thái tài khoản?"}
              </p>
              <div className="space-y-2 rounded-md bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <strong>Từ:</strong>{" "}
                  <AccountStatusBadge status={user.accountStatus} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <strong>Sang:</strong>{" "}
                  <AccountStatusBadge status={form.watch("accountStatus")} />
                </div>
              </div>
              {form.watch("accountStatus") === "BANNED" && (
                <AlertSection
                  variant="destructive"
                  description="Người dùng sẽ không thể đăng nhập, đấu giá hoặc sử dụng bất kỳ chức năng nào trên hệ thống."
                />
              )}
            </div>
          }
          variant={
            form.watch("accountStatus") === "BANNED" ? "destructive" : "default"
          }
          confirmLabel="Xác nhận"
          confirmIcon={Shield}
          onConfirm={handleConfirmSubmit}
          isConfirming={isConfirming}
        />
      </div>
    </form>
  );
};

export default UpdateAccountStatusForm;
