import { AuthForm } from "@/components/features/auth";
import { api } from "@/lib/api-layer";
import { registerSchema } from "@/lib/validations/auth.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đăng ký - Online Auction" },
    { name: "description", content: "Trang đăng ký dành cho Online Auction" },
  ];
}

export default function RegisterPage() {
  return (
    <AuthForm
      formType="REGISTER"
      schema={registerSchema}
      defaultValues={{
        fullName: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
        recaptchaToken: "",
      }}
      onSubmit={(data) => api.auth.register(data)}
    />
  );
}
