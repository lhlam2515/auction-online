import React from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { ForgotPasswordForm } from "@/components/features/auth";
import { STORAGE_KEYS } from "@/constants/api";
import { APP_ROUTES, AUTH_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import { resetPasswordSchema } from "@/lib/validations/auth.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đặt lại mật khẩu - Online Auction" },
    {
      name: "description",
      content:
        "Đặt lại mật khẩu tài khoản của bạn trên hệ thống Online Auction.",
    },
  ];
}

export default function ResetPasswordPage() {
  const [resetToken] = React.useState(
    () => localStorage.getItem(STORAGE_KEYS.RESET_TOKEN) || ""
  );
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!resetToken) {
      const from = location.state?.from?.pathname;
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      navigate(from || APP_ROUTES.HOME, { replace: true });
    }
  }, [navigate, location.state, resetToken]);

  return (
    <ForgotPasswordForm
      formType="RESET_PASSWORD"
      schema={resetPasswordSchema}
      defaultValues={{ newPassword: "", confirmNewPassword: "" }}
      onSubmit={(data) =>
        api.auth.resetPassword({
          resetToken,
          newPassword: data.newPassword,
        })
      }
      onSuccess={(_) => navigate(AUTH_ROUTES.LOGIN)}
    />
  );
}
