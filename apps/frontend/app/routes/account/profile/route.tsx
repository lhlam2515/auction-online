import type { User } from "@repo/shared-types";
import { Camera } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";

import ChangePasswordForm from "@/components/features/user/ChangePasswordForm";
import UserProfileForm from "@/components/features/user/UserProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";
import {
  changePassword,
  updateProfileSchema,
  type UpdateProfileSchemaType,
} from "@/lib/validations/user.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
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
  const [userData, setUserData] = useState<User>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const defaultValues: UpdateProfileSchemaType = useMemo(
    () => ({
      fullName: userData?.fullName || "",
      email: userData?.email || "",
      birthDate: userData?.birthDate ? new Date(userData.birthDate) : undefined,
      address: userData?.address || "",
    }),
    [userData]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.users.getProfile();

        if (!result.success) {
          throw new Error(
            result.error?.message || "Lỗi khi tải thông tin người dùng"
          );
        }

        logger.info("User profile data:", { result });
        setUserData(result.data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);

        showError(error, errorMessage);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileSubmit = useCallback(
    async (data: UpdateProfileSchemaType) => {
      const result = await api.users.updateProfile({
        fullName: data.fullName,
        email: data.email,
        birthDate: data.birthDate
          ? data.birthDate.toISOString().split("T")[0]
          : null,
        address: data.address || "",
        avatarUrl: userData?.avatarUrl || null,
      });
      return result;
    },
    [userData?.avatarUrl]
  );

  const handlePasswordSubmit = useCallback(
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
        <Card className="grid grid-cols-2">
          <CardContent className="space-y-6">
            <UserProfileForm
              schema={updateProfileSchema}
              defaultValues={defaultValues}
              onSubmit={handleProfileSubmit}
              isLoading={isLoadingProfile}
            />
          </CardContent>

          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <CardTitle className="text-2xl">Thông Tin Cá Nhân</CardTitle>
              <CardDescription className="text-xl">
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="size-40">
                {userData && userData.avatarUrl ? (
                  <AvatarImage
                    src={userData.avatarUrl}
                    alt={userData.fullName}
                    className="object-cover"
                    width={24}
                    height={24}
                  />
                ) : (
                  <AvatarFallback>
                    {userData?.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>

              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
              >
                <Camera className="mr-2 h-4 w-4" />
                Thay Đổi Ảnh
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Section 2: Security */}
        <ChangePasswordForm
          schema={changePassword}
          defaultValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          onSubmit={handlePasswordSubmit}
        />
      </div>
    </div>
  );
}
