import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminUser, UpdateUserRoleRequest } from "@repo/shared-types";
import { Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { RoleBadge } from "@/components/common/badges";
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
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { updateUserRoleSchema } from "@/lib/validations/admin.validation";

type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;

type UpdateUserRoleFormProps = {
  userId: string;
  user: AdminUser;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const UpdateUserRoleForm = ({
  userId,
  user,
  onSuccess,
  onCancel,
}: UpdateUserRoleFormProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const form = useForm<UpdateUserRoleFormData>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      role: user.role || "BIDDER",
    },
  });

  const handleConfirmSubmit = async () => {
    const data = form.getValues();

    try {
      setIsConfirming(true);
      form.clearErrors();

      const updateData: UpdateUserRoleRequest = {
        role: data.role,
      };

      const response = await api.admin.users.updateRole(userId, updateData);

      if (!response.success) {
        throw new Error(response.error?.message || "Lỗi khi cập nhật vai trò");
      }

      toast.success("Cập nhật vai trò người dùng thành công!");
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Lỗi khi cập nhật vai trò người dùng"
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

  const watchedRole = form.watch("role");
  const hasChanges = watchedRole !== user.role;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      {form.formState.errors.root && (
        <AlertSection
          variant="destructive"
          description={form.formState.errors.root.message}
        />
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Vai trò hiện tại</label>
        <div>
          <RoleBadge role={user.role} />
        </div>
      </div>

      <Controller
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="flex w-full flex-col gap-2"
          >
            <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
              Thay đổi vai trò <span className="text-red-500">*</span>
            </FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            >
              <SelectTrigger
                id={field.name}
                className="border"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BIDDER">
                  <div className="flex items-center gap-2">
                    <span>BIDDER</span>
                    <span className="text-muted-foreground text-xs">
                      (Người đấu giá)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="SELLER">
                  <div className="flex items-center gap-2">
                    <span>SELLER</span>
                    <span className="text-muted-foreground text-xs">
                      (Người bán)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <span>ADMIN</span>
                    <span className="text-muted-foreground text-xs">
                      (Quản trị viên)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {hasChanges && (
        <AlertSection
          variant="warning"
          icon={AlertTriangle}
          title="Cảnh báo"
          description={getWarningMessage(user.role, watchedRole)}
        />
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Hủy
          </Button>
        )}
        <ConfirmationDialog
          trigger={
            <Button
              type="button"
              disabled={
                !hasChanges || form.formState.isSubmitting || isConfirming
              }
            >
              {isConfirming ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Cập nhật vai trò
                </>
              )}
            </Button>
          }
          title="Xác nhận thay đổi vai trò"
          description={getConfirmationMessage(
            user.fullName,
            user.role,
            watchedRole
          )}
          variant="warning"
          confirmLabel="Xác nhận thay đổi"
          cancelLabel="Hủy"
          onConfirm={handleConfirmSubmit}
          isConfirming={isConfirming}
        />
      </div>
    </form>
  );
};

const getWarningMessage = (currentRole: string, newRole: string): string => {
  if (newRole === "ADMIN") {
    return "Cấp quyền ADMIN sẽ cho phép người dùng này toàn quyền quản lý hệ thống. Hãy cẩn thận!";
  }

  if (currentRole === "ADMIN" && newRole !== "ADMIN") {
    return "Thu hồi quyền ADMIN sẽ khiến người dùng mất quyền quản lý hệ thống.";
  }

  if (newRole === "SELLER") {
    return "Nâng cấp lên SELLER sẽ cho phép người dùng tạo và bán sản phẩm đấu giá.";
  }

  if (currentRole === "SELLER" && newRole === "BIDDER") {
    return "Giáng cấp xuống BIDDER sẽ khiến người dùng mất quyền tạo sản phẩm đấu giá.";
  }

  return "Thay đổi vai trò sẽ ảnh hưởng đến quyền hạn của người dùng trong hệ thống.";
};

const getConfirmationMessage = (
  userName: string,
  currentRole: string,
  newRole: string
): string => {
  return `Bạn có chắc chắn muốn thay đổi vai trò của "${userName}" từ ${currentRole} sang ${newRole}? Hành động này sẽ ngay lập tức ảnh hưởng đến quyền hạn của người dùng.`;
};

export default UpdateUserRoleForm;
