import React from "react";

import {
  ForgotPasswordForm,
  VerifyOTPForm,
} from "@/components/features/auth/forms";
import { api } from "@/lib/api-layer";
import {
  forgotPasswordSchema,
  verifyOtpSchema,
} from "@/lib/validations/auth.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quên mật khẩu - Online Auction" },
    {
      name: "description",
      content:
        "Trang xác nhận quên mật khẩu cho người dùng trên Online Auction.",
    },
  ];
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState<string>("");
  const [sentOTP, setSentOTP] = React.useState<boolean>(false);

  return !sentOTP ? (
    <ForgotPasswordForm
      formType="REQUEST_OTP"
      schema={forgotPasswordSchema}
      defaultValues={{ email: "", recaptchaToken: "" }}
      onSubmit={(data) => api.auth.forgotPassword(data)}
      onSuccess={(data) => {
        setEmail(data.email);
        setSentOTP(true);
      }}
    />
  ) : (
    <VerifyOTPForm
      formType="PASSWORD_RESET"
      schema={verifyOtpSchema}
      defaultValues={{ email, otp: "" }}
      onSubmit={(data) =>
        api.auth.verifyOtp({ email: data.email, otp: data.otp })
      }
    />
  );
}
