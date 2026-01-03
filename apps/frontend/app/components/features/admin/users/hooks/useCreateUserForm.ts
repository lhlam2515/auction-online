import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateUserRequest, UserRole } from "@repo/shared-types";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { createUserSchema } from "@/lib/validations/admin.validation";

type CreateUserForm = z.infer<typeof createUserSchema>;

type UseCreateUserFormProps = {
  onSuccess?: () => void;
};

export const useCreateUserForm = ({ onSuccess }: UseCreateUserFormProps) => {
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      username: "",
      fullName: "",
      password: "",
      role: "BIDDER",
      address: "",
      birthDate: "",
    },
  });

  const email = form.watch("email");
  const username = form.watch("username");
  const fullName = form.watch("fullName");
  const password = form.watch("password");
  const role = form.watch("role");
  const address = form.watch("address");
  const birthDate = form.watch("birthDate");

  const isFormValid =
    email.trim() !== "" &&
    username.trim() !== "" &&
    fullName.trim() !== "" &&
    password !== "";

  const submitCreateUser = async () => {
    const data = form.getValues();

    try {
      form.clearErrors();

      const payload: CreateUserRequest = {
        email: data.email.trim(),
        username: data.username.trim(),
        fullName: data.fullName.trim(),
        password: data.password,
        role: data.role as UserRole,
        address: data.address?.trim() || undefined,
        birthDate: data.birthDate || undefined,
      };

      const response = await api.admin.users.create(payload);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Lỗi khi tạo tài khoản người dùng"
        );
      }

      toast.success("Tạo tài khoản thành công!");
      form.reset();
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Lỗi khi tạo tài khoản người dùng"
      );
      form.setError("root", { message: errorMessage });
      showError(err, errorMessage);
      throw err;
    }
  };

  const resetForm = () => {
    form.reset({
      email: "",
      username: "",
      fullName: "",
      password: "",
      role: "BIDDER",
      address: "",
      birthDate: "",
    });
  };

  return {
    form,
    email,
    username,
    fullName,
    password,
    role,
    address,
    birthDate,
    isFormValid,
    submitCreateUser,
    resetForm,
  };
};
