import type { User } from "@repo/shared-types";
import { Lock, User as UserIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";

import { UserAvatarUploader } from "@/components/features/user";
import {
  UserProfileForm,
  ChangePasswordForm,
} from "@/components/features/user/forms";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";
import {
  changePassword,
  updateProfileSchema,
} from "@/lib/validations/user.validation";

type ProfileFormData = z.infer<typeof updateProfileSchema>;

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hồ Sơ Người Dùng - Online Auction" },
    {
      name: "description",
      content: "Trang hồ sơ người dùng cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function UserProfilePage() {
  const [userData, setUserData] = useState<User>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );

  const defaultValues: ProfileFormData = useMemo(
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
    async (data: ProfileFormData) => {
      // Create FormData to send both fields and file
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      if (data.email) formData.append("email", data.email);
      if (data.address) formData.append("address", data.address);
      if (data.birthDate) {
        formData.append(
          "birthDate",
          data.birthDate.toISOString().split("T")[0]
        );
      }

      // If a new avatar file was selected, append it
      if (selectedAvatarFile) {
        formData.append("avatar", selectedAvatarFile);
      } else if (data.avatarUrl) {
        // If no new file but we have url (maybe didn't change), we can send it or let backend keep current
        formData.append("avatarUrl", data.avatarUrl);
      }

      const result = await api.users.updateProfile(formData);

      if (result.success && result.data) {
        setUserData(result.data);
        setSelectedAvatarFile(null);
      }

      return result;
    },
    [selectedAvatarFile]
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
    <div className="space-y-6">
      {/* Section 1: Personal Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <UserIcon className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Thông tin cá nhân</CardTitle>
              <CardDescription className="text-lg">
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 space-y-6">
          <UserProfileForm
            schema={updateProfileSchema}
            defaultValues={defaultValues}
            onSubmit={handleProfileSubmit}
            isLoading={isLoadingProfile}
          />
          <UserAvatarUploader
            userData={userData}
            onFileSelect={setSelectedAvatarFile}
            isLoading={isLoadingProfile}
          />
        </CardContent>
      </Card>

      {/* Section 2: Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Lock className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Bảo Mật Tài Khoản</CardTitle>
              <CardDescription className="text-lg">
                Thay đổi mật khẩu để bảo vệ tài khoản của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ChangePasswordForm
            schema={changePassword}
            defaultValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            onSubmit={handlePasswordSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
