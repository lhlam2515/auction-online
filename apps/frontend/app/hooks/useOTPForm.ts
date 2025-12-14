import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse, SuccessResponse } from "@repo/shared-types";
import { useEffect, useRef, useState } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { ZodType } from "zod";

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";

interface UseOTPFormConfig<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  onSuccess?: (data: T, result: SuccessResponse, message: string) => void;
  onError?: (data: T, error: unknown, errorMessage: string) => void;
  enableResendCountdown?: boolean;
  resendCountdownSeconds?: number;
}

export const useOTPForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  formType,
  onSuccess,
  onError,
  enableResendCountdown = true,
  resendCountdownSeconds = 30,
}: UseOTPFormConfig<T>) => {
  const [resendCountdown, setResendCountdown] = useState(
    enableResendCountdown ? resendCountdownSeconds : 0
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (enableResendCountdown && resendCountdown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [resendCountdown, enableResendCountdown]);

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      form.clearErrors();

      const result = (await onSubmit(data)) as ApiResponse;

      if (!result.success) {
        logger.error("OTPForm handleSubmit error:", result.error);
        throw new Error(result.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      // Show success message
      const successMessage =
        formType === "EMAIL_VERIFICATION"
          ? SUCCESS_MESSAGES.OTP_VERIFIED
          : SUCCESS_MESSAGES.RESET_OTP_VERIFIED;

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

  const handleResendOtp = async (resendFn: () => Promise<ApiResponse>) => {
    try {
      const result = await resendFn();

      if (!result.success) {
        logger.error("OTPForm handleResendOtp error:", result.error);
        throw new Error(result.error?.message || ERROR_MESSAGES.SERVER_ERROR);
      }

      // Reset countdown if enabled
      if (enableResendCountdown) {
        setResendCountdown(resendCountdownSeconds);
      }

      return {
        success: true,
        data: result,
        message: "Mã OTP đã được gửi lại!",
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      // Show error notification
      showError(error, errorMessage);

      return { success: false, error, message: errorMessage };
    }
  };

  return {
    form,
    handleSubmit,
    handleResendOtp,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    resendCountdown,
    canResend: resendCountdown === 0,
  };
};
