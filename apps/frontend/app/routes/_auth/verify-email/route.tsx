import React from "react";

import { VerifyOTPForm } from "@/components/features/auth";
import { STORAGE_KEYS } from "@/constants/api";
import { api } from "@/lib/api-layer";
import { verifyOtpSchema } from "@/lib/validations/auth.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xác nhận Email - Online Auction" },
    {
      name: "description",
      content: "Xác nhận mã OTP để kích hoạt tài khoản Online Auction",
    },
  ];
}

export default function VerifyEmailPage() {
  const [pendingEmail] = React.useState(
    () => localStorage.getItem(STORAGE_KEYS.PENDING_EMAIL) || ""
  );

  return (
    <VerifyOTPForm
      formType="EMAIL_VERIFICATION"
      schema={verifyOtpSchema}
      defaultValues={{
        email: pendingEmail,
        otp: "",
      }}
      onSubmit={(data) => api.auth.verifyEmail(data)}
    />
  );
}
