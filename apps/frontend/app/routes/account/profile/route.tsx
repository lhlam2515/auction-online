import { useCallback, useState } from "react";
import type z from "zod";

import { api } from "@/lib/api-layer";
import { changePassword } from "@/lib/validations/user.validation";

import type { Route } from "./+types/route";
import ChangePasswordForm from "../../../components/features/user/ChangePasswordForm";
import UserProfileForm from "../../../components/features/user/UserProfileForm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Profile - Online Auction" },
    {
      name: "description",
      content: "User Profile page for Online Auction App",
    },
  ];
}

export default function UserProfilePage() {
  const handleSubmit = useCallback(
    async (data: z.infer<typeof changePassword>) => {
      const result = await api.users.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return result;
    },
    []
  );
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Cài Đặt Tài Khoản
        </h1>
        <p className="text-slate-600">
          Quản lý thông tin cá nhân và cài đặt bảo mật
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Personal Info */}
        <UserProfileForm />
        {/* Section 2: Security */}
        <ChangePasswordForm
          schema={changePassword}
          defaultValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
