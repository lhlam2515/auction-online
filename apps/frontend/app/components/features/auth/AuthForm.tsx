import type { ApiResponse } from "@repo/shared-types";
import { FormProvider, type FieldValues } from "react-hook-form";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { STORAGE_KEYS } from "@/constants/api";
import {
  isPublicRoute,
  isAuthRoute,
  getRedirectAfterLogin,
  AUTH_ROUTES,
} from "@/constants/routes";
import { useAuthForm } from "@/hooks/useAuthForm";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import { ApiError } from "@/types/api";

import AuthFormFields from "./AuthFormFields";
interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "LOGIN" | "REGISTER";
}

const AuthForm = <T extends FieldValues>(props: AuthFormProps<T>) => {
  const { formType, defaultValues } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const { form, handleSubmit, isSubmitting, errors } = useAuthForm({
    ...props,
    onSuccess: (data, result, message) => {
      toast.success(message);

      if (formType === "LOGIN" && result.data?.user) {
        const from = location.state?.from?.pathname;

        if (from && isPublicRoute(from) && !isAuthRoute(from)) {
          navigate(from, { replace: true });
          return;
        }

        navigate(getRedirectAfterLogin(result.data.user.role), {
          replace: true,
        });
      } else if (formType === "REGISTER") {
        // Store pending email for verification
        localStorage.setItem(STORAGE_KEYS.PENDING_EMAIL, data.email);
        navigate(AUTH_ROUTES.VERIFY_EMAIL, { replace: true });
      }
    },
    onError: (data, error, _errorMessage) => {
      const handleVerifyEmailError = async (email: string) => {
        // Store pending email for verification
        localStorage.setItem(STORAGE_KEYS.PENDING_EMAIL, email);

        toast.info("Đang gửi lại email xác thực...");

        await api.auth.resendOtp({ email, purpose: "EMAIL_VERIFICATION" });

        toast.success(
          "OTP xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư đến của bạn."
        );

        navigate(AUTH_ROUTES.VERIFY_EMAIL, { replace: true });
      };

      if (
        formType === "LOGIN" &&
        error instanceof ApiError &&
        error.code === "EMAIL_NOT_VERIFIED"
      ) {
        handleVerifyEmailError(data.email);
      }
    },
  });

  const formId = formType === "LOGIN" ? "login-form" : "register-form";
  const buttonText = formType === "LOGIN" ? "Đăng nhập" : "Đăng ký";

  return (
    <FormProvider {...form}>
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

        <AuthFormFields defaultValues={defaultValues} formType={formType} />

        <Button
          type="submit"
          className="min-h-12 w-full text-xl"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner />}
          {isSubmitting
            ? buttonText === "Đăng nhập"
              ? "Đang đăng nhập..."
              : "Đang đăng ký..."
            : buttonText}
        </Button>
      </form>
    </FormProvider>
  );
};

export default AuthForm;
