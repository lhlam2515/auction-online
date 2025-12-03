import { useCallback } from "react";
import type { z } from "zod";

import AuthForm from "@/components/features/auth/AuthForm";
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
  const handleSubmit = useCallback(
    async (data: z.infer<typeof registerSchema>) => {
      const result = await api.auth.register(data);
      return result;
    },
    []
  );

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
      }}
      onSubmit={handleSubmit}
    />
  );
}
