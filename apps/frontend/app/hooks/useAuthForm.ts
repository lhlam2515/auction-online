import { zodResolver } from "@hookform/resolvers/zod";
import type {
  ApiResponse,
  SuccessResponse,
  UserAuthData,
} from "@repo/shared-types";
import {
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { ZodType } from "zod";

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { useAuth } from "@/contexts/auth-provider";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";

interface UseAuthFormConfig<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "LOGIN" | "REGISTER";
  onSuccess?: (
    data: T,
    result: SuccessResponse<{ user: UserAuthData } | null>,
    message: string
  ) => void;
  onError?: (data: T, error: unknown, errorMessage: string) => void;
}

export const useAuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  formType,
  onSuccess,
  onError,
}: UseAuthFormConfig<T>) => {
  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });
  const { login } = useAuth();

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      form.clearErrors();

      const result = (await onSubmit(data)) as ApiResponse<{
        user: UserAuthData;
      } | null>;

      if (!result.success) {
        logger.error("AuthForm handleSubmit error:", result.error);
        throw new Error(result.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      // Show success message
      const successMessage =
        formType === "LOGIN"
          ? SUCCESS_MESSAGES.LOGIN
          : SUCCESS_MESSAGES.REGISTER;

      if (formType === "LOGIN" && result.data?.user) {
        login(result.data.user); // Update the auth context
      }

      // Call onSuccess callback if provided
      onSuccess?.(data, result, successMessage);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      // Set form error
      form.setError("root", {
        message: errorMessage,
      });

      // Show error notification
      showError(error, errorMessage);

      // Call onError callback if provided
      onError?.(data, error, errorMessage);
    }
  };

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};
