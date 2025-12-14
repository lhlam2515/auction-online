import type { ApiResponse, VerifyOtpResponse } from "@repo/shared-types";
import { Controller, type FieldValues, type Path } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { STORAGE_KEYS } from "@/constants/api";
import { AUTH_ROUTES } from "@/constants/routes";
import { useOTPForm } from "@/hooks/useOTPForm";
import { api } from "@/lib/api-layer";

import OTPInput from "./OTPInput";

interface VerifyOTPFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}

const VerifyOTPForm = <T extends FieldValues>(props: VerifyOTPFormProps<T>) => {
  const { formType } = props;
  const navigate = useNavigate();

  const {
    form,
    handleSubmit,
    handleResendOtp,
    isSubmitting,
    errors,
    resendCountdown,
    canResend,
  } = useOTPForm({
    ...props,
    onSuccess: (data, result, message) => {
      toast.success(message);

      // Clean up storage and navigate
      if (formType === "EMAIL_VERIFICATION") {
        localStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
        navigate(AUTH_ROUTES.LOGIN, { replace: true });
      } else {
        const { resetToken, expiresAt } = result.data as VerifyOtpResponse;
        localStorage.setItem(STORAGE_KEYS.RESET_TOKEN, resetToken);
        setTimeout(
          () => {
            localStorage.removeItem(STORAGE_KEYS.RESET_TOKEN);
          },
          new Date(expiresAt).getTime() - Date.now()
        );
        navigate(AUTH_ROUTES.RESET_PASSWORD, { replace: true });
      }
    },
  });

  const getButtonText = () => {
    return formType === "EMAIL_VERIFICATION" ? "Xác nhận" : "Tiếp tục";
  };

  const getResendText = () => {
    if (resendCountdown > 0) {
      return `Gửi lại sau ${resendCountdown}s`;
    }
    return "Gửi lại mã OTP";
  };

  const onResendOtp = async () => {
    const values = form.getValues();
    const email = (values as Record<string, unknown>).email;
    if (!email || typeof email !== "string") {
      toast.error("Không tìm thấy email. Vui lòng thử lại.");
      return;
    }

    const result = await handleResendOtp(() =>
      api.auth.resendOtp({ email, purpose: formType })
    );

    if (result.success) {
      toast.success(result.message);
    }
  };

  const formId =
    formType === "EMAIL_VERIFICATION"
      ? "verify-email-form"
      : "verify-reset-form";

  return (
    <form
      id={formId}
      // @ts-expect-error - Generic type constraint between form and handler
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
      noValidate
    >
      {errors.root && (
        <div className="error-message">
          <p>{errors.root.message}</p>
        </div>
      )}

      <FieldGroup className="gap-4">
        <Controller
          key="otp"
          control={form.control}
          name={"otp" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="sr-only text-base font-semibold"
              >
                Mã OTP
              </FieldLabel>
              <OTPInput
                {...field}
                id={field.name}
                maxLength={6}
                aria-invalid={fieldState.invalid}
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <div className="flex items-center">
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <Button
                  variant="link"
                  onClick={onResendOtp}
                  className="ml-auto"
                  disabled={isSubmitting || !canResend}
                  type="button"
                >
                  {getResendText()}
                </Button>
              </div>
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="min-h-12 w-full cursor-pointer text-xl"
        disabled={isSubmitting}
      >
        {isSubmitting && <Spinner />}
        {isSubmitting
          ? `Đang ${getButtonText().toLowerCase()}...`
          : getButtonText()}
      </Button>
    </form>
  );
};

export default VerifyOTPForm;
