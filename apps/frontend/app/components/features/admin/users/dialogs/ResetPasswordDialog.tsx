import { zodResolver } from "@hookform/resolvers/zod";
import type { ResetUserPasswordRequest } from "@repo/shared-types";
import { Key, Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { UserAvatar } from "@/components/common";
import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { resetUserPasswordSchema } from "@/lib/validations/admin.validation";

type ResetPasswordForm = z.infer<typeof resetUserPasswordSchema>;

type ResetPasswordDialogProps = {
  userId: string;
  userName?: string;
  userEmail?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

const ResetPasswordDialog = ({
  userId,
  userName,
  userEmail,
  trigger,
  onSuccess,
}: ResetPasswordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");

  // Password requirement checks
  const passwordRequirements = [
    {
      label: "Tối thiểu 8 ký tự",
      met: newPassword.length >= 8,
    },
    {
      label: "Có ít nhất một chữ hoa (A-Z)",
      met: /[A-Z]/.test(newPassword),
    },
    {
      label: "Có ít nhất một chữ thường (a-z)",
      met: /[a-z]/.test(newPassword),
    },
    {
      label: "Có ít nhất một số (0-9)",
      met: /\d/.test(newPassword),
    },
    {
      label: "Có ít nhất một ký tự đặc biệt (!@#$%^&*)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
    {
      label: "Mật khẩu xác nhận khớp",
      met:
        confirmPassword.length > 0 &&
        newPassword === confirmPassword &&
        newPassword.length > 0,
    },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleConfirmSubmit = async () => {
    const data = form.getValues();

    try {
      setIsConfirming(true);
      form.clearErrors();

      const updateData: ResetUserPasswordRequest = {
        newPassword: data.newPassword,
      };

      const response = await api.admin.users.resetPassword(userId, updateData);

      if (!response.success) {
        throw new Error(response.error?.message || "Lỗi khi đặt lại mật khẩu");
      }

      toast.success("Đặt lại mật khẩu thành công!");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Lỗi khi đặt lại mật khẩu");
      form.setError("root", { message: errorMessage });
      showError(err, errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Đặt lại mật khẩu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Đặt lại mật khẩu người dùng
          </DialogTitle>
          <DialogDescription>
            Thiết lập mật khẩu mới cho tài khoản người dùng
          </DialogDescription>
        </DialogHeader>

        {/* User Info Preview */}
        {(userName || userEmail) && (
          <>
            <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
              <UserAvatar
                name={userName || userEmail || "User"}
                className="h-10 w-10"
              />
              <div className="flex-1">
                {userName && <p className="text-sm font-medium">{userName}</p>}
                {userEmail && (
                  <p className="text-muted-foreground text-xs">{userEmail}</p>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

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
            {/* New Password Field */}
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
                    Mật khẩu mới <span className="text-red-500">*</span>
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
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FieldDescription className="text-muted-foreground text-xs">
                    Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự
                    đặc biệt
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Confirm Password Field */}
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
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Password Requirements Checklist */}
            {newPassword.length > 0 && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Yêu cầu mật khẩu:
                </p>
                <div className="space-y-2">
                  {passwordRequirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {requirement.met ? (
                        <Check className="h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span
                        className={
                          requirement.met ? "text-green-700" : "text-gray-600"
                        }
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
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  disabled={!allRequirementsMet || isConfirming}
                  className="cursor-pointer"
                  variant="destructive"
                >
                  <Key className="h-4 w-4" />
                  Đặt lại mật khẩu
                </Button>
              }
              title="Xác nhận đặt lại mật khẩu"
              description={
                <div className="space-y-3">
                  <p>
                    Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này?
                  </p>
                  {(userName || userEmail) && (
                    <div className="rounded-md bg-gray-50 p-3">
                      {userName && (
                        <p className="text-sm">
                          <strong>Người dùng:</strong> {userName}
                        </p>
                      )}
                      {userEmail && (
                        <p className="text-sm">
                          <strong>Email:</strong> {userEmail}
                        </p>
                      )}
                    </div>
                  )}
                  <AlertSection
                    variant="warning"
                    description="Người dùng sẽ phải sử dụng mật khẩu mới để đăng nhập. Hãy chắc chắn thông báo cho họ về thay đổi này."
                  />
                </div>
              }
              variant="destructive"
              confirmLabel="Xác nhận đặt lại"
              confirmIcon={Key}
              onConfirm={handleConfirmSubmit}
              isConfirming={isConfirming}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
