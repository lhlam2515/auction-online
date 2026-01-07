import { AuthForm } from "@/components/features/auth/forms";
import { api } from "@/lib/api-layer";
import { loginSchema } from "@/lib/validations/auth.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đăng nhập - Online Auction" },
    { name: "description", content: "Trang đăng nhập dành cho Online Auction" },
  ];
}

export default function LoginPage() {
  return (
    <AuthForm
      formType="LOGIN"
      schema={loginSchema}
      defaultValues={{ email: "", password: "", recaptchaToken: "" }}
      onSubmit={(data) => api.auth.login(data)}
    />
  );
}
