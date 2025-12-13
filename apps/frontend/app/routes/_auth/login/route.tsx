import { useCallback } from "react";
import type { z } from "zod";

import AuthForm from "@/components/features/auth/AuthForm";
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
  const handleSubmit = useCallback(
    async (data: z.infer<typeof loginSchema>) => {
      const result = await api.auth.login(data);
      return result;
    },
    []
  );

  return (
    <AuthForm
      formType="LOGIN"
      schema={loginSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={handleSubmit}
    />
  );
}
