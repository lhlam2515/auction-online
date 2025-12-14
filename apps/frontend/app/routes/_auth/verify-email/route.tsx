import VerifyOTPForm from "@/components/features/auth/VerifyOTPForm";
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
  return (
    <VerifyOTPForm
      formType="EMAIL_VERIFICATION"
      schema={verifyOtpSchema}
      defaultValues={{
        email: localStorage.getItem(STORAGE_KEYS.PENDING_EMAIL) || "",
        otp: "",
      }}
      onSubmit={(data) => api.auth.verifyEmail(data)}
    />
  );
}
