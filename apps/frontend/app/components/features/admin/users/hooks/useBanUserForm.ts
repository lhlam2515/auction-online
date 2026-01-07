import { zodResolver } from "@hookform/resolvers/zod";
import type { BanUserRequest } from "@repo/shared-types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { banUserSchema } from "@/lib/validations/admin.validation";

type BanUserForm = z.infer<typeof banUserSchema>;

type UseBanUserFormProps = {
  userId: string;
  currentStatus?: "ACTIVE" | "BANNED" | "PENDING_VERIFICATION";
  onSuccess?: () => void;
};

export const useBanUserForm = ({
  userId,
  currentStatus,
  onSuccess,
}: UseBanUserFormProps) => {
  const form = useForm<BanUserForm>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      isBanned: currentStatus !== "BANNED",
      reason: "",
      duration: 0,
    },
  });

  const isBanned = form.watch("isBanned");
  const reason = form.watch("reason");
  const duration = form.watch("duration");

  const isFormValid =
    !isBanned ||
    Boolean(reason && reason.length >= 10 && duration !== undefined);

  const submitBanUser = async () => {
    const data = form.getValues();

    try {
      form.clearErrors();

      const updateData: BanUserRequest = {
        isBanned: data.isBanned,
        reason: data.isBanned ? data.reason : undefined,
        duration: data.isBanned ? data.duration : undefined,
      };

      const response = await api.admin.users.ban(userId, updateData);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Lỗi khi cập nhật trạng thái ban"
        );
      }

      toast.success(
        data.isBanned
          ? "Đã ban người dùng thành công!"
          : "Đã gỡ ban người dùng thành công!"
      );
      form.reset();
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Lỗi khi cập nhật trạng thái ban"
      );
      form.setError("root", { message: errorMessage });
      showError(err, errorMessage);
      throw err;
    }
  };

  const resetForm = () => {
    form.reset({
      isBanned: currentStatus !== "BANNED",
      reason: "",
      duration: 0,
    });
  };

  return {
    form,
    isBanned,
    reason,
    duration,
    isFormValid,
    submitBanUser,
    resetForm,
  };
};
