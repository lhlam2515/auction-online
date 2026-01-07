import { zodResolver } from "@hookform/resolvers/zod";
import type { ResetUserPasswordRequest } from "@repo/shared-types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { resetUserPasswordSchema } from "@/lib/validations/admin.validation";

type ResetPasswordForm = z.infer<typeof resetUserPasswordSchema>;

type UseResetPasswordFormProps = {
  userId: string;
  onSuccess?: () => void;
};

type PasswordRequirement = {
  label: string;
  met: boolean;
};

export const useResetPasswordForm = ({
  userId,
  onSuccess,
}: UseResetPasswordFormProps) => {
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");

  const passwordRequirements: PasswordRequirement[] = [
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

  const submitResetPassword = async () => {
    const data = form.getValues();

    try {
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
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Lỗi khi đặt lại mật khẩu");
      form.setError("root", { message: errorMessage });
      showError(err, errorMessage);
      throw err;
    }
  };

  return {
    form,
    newPassword,
    confirmPassword,
    passwordRequirements,
    allRequirementsMet,
    submitResetPassword,
  };
};
