import { Key, Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

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
import { cn } from "@/lib/utils";

type ResetPasswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

type PasswordRequirement = {
  label: string;
  met: boolean;
};

type ResetPasswordFormProps = {
  form: UseFormReturn<ResetPasswordFormData>;
  newPassword: string;
  confirmPassword: string;
  passwordRequirements: PasswordRequirement[];
  allRequirementsMet: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

const ResetPasswordForm = ({
  form,
  newPassword,
  passwordRequirements,
  allRequirementsMet,
  onCancel,
  onSubmit,
  isSubmitting,
}: ResetPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    onCancel();
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
      {form.formState.errors.root && (
        <AlertSection
          variant="destructive"
          description={form.formState.errors.root.message}
        />
      )}

      <AlertSection
        variant="warning"
        icon={AlertTriangle}
        title="Lưu ý quan trọng"
        description="Người dùng sẽ cần sử dụng mật khẩu mới để đăng nhập. Hãy chắc chắn thông báo cho họ về thay đổi này."
      />

      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-semibold"
              >
                Mật khẩu mới <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  className="border pr-10"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FieldDescription className="text-muted-foreground text-xs">
                Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc
                biệt
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-semibold"
              >
                Xác nhận mật khẩu <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  type={showConfirmPassword ? "text" : "password"}
                  className="border pr-10"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {newPassword.length > 0 && (
          <div className="bg-muted/50 rounded-md border p-4">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              Yêu cầu mật khẩu:
            </p>
            <div className="space-y-2">
              {passwordRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {requirement.met ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <X className="text-destructive h-4 w-4 shrink-0" />
                  )}
                  <span
                    className={cn(
                      requirement.met
                        ? "text-emerald-700"
                        : "text-muted-foreground"
                    )}
                  >
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isConfirming}
          className="cursor-pointer"
        >
          Hủy
        </Button>
        <ConfirmationDialog
          trigger={
            <Button
              type="button"
              disabled={!allRequirementsMet || isSubmitting || isConfirming}
              variant="destructive"
              className="cursor-pointer"
            >
              <Key className="h-4 w-4" />
              {isConfirming ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          }
          title="Xác nhận đặt lại mật khẩu"
          description={
            <div className="space-y-3">
              <p>
                Bạn có chắc chắn muốn đặt lại mật khẩu? Người dùng sẽ cần đăng
                nhập bằng mật khẩu mới.
              </p>
              <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-600">
                  Mật khẩu mới sẽ được gửi cho người dùng qua email
                </p>
                <p className="text-sm text-amber-600">
                  Đảm bảo rằng email của họ vẫn hoạt động bình thường.
                </p>
              </div>
            </div>
          }
          variant="danger"
          confirmLabel="Xác nhận đặt lại"
          confirmIcon={Key}
          onConfirm={handleConfirmSubmit}
          isConfirming={isConfirming}
        />
      </div>
    </form>
  );
};

export default ResetPasswordForm;
