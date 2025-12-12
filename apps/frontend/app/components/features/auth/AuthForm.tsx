import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse, UserAuthData } from "@repo/shared-types";
import {
  Controller,
  type DefaultValues,
  type FieldValues,
  type Path,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router";
import { toast } from "sonner";
import { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import {
  AUTH_ROUTES,
  getRedirectAfterLogin,
  isAuthRoute,
} from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "LOGIN" | "REGISTER";
}

const AuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      const result = await onSubmit(data);

      if (result?.success && result.data) {
        toast.success(
          formType === "LOGIN"
            ? SUCCESS_MESSAGES.LOGIN
            : SUCCESS_MESSAGES.REGISTER
        );

        const from = location.state?.from?.pathname;

        // If login, save auth data
        if (formType === "LOGIN") {
          const { user } = result.data as { user: UserAuthData };

          if (user.accountStatus === "PENDING_VERIFICATION") {
            navigate(AUTH_ROUTES.VERIFY, { replace: true });
            return;
          }

          // login() no longer receives accessToken parameter
          // Token is now stored in httpOnly cookie by the browser
          login(user);

          const redirectPath = getRedirectAfterLogin(user.role);
          if (from && isAuthRoute(from) === false) {
            navigate(from, { replace: true });
          } else {
            navigate(redirectPath, { replace: true });
          }
          return;
        } else {
          // If registration, navigate to verify page
          navigate(AUTH_ROUTES.VERIFY, { replace: true });
        }
      } else {
        toast.error(result?.message || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  const formId = formType === "LOGIN" ? "login-form" : "register-form";
  const buttonText = formType === "LOGIN" ? "Đăng nhập" : "Đăng ký";

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      fullName: "Họ và Tên",
      email: "Địa chỉ Email",
      address: "Địa chỉ",
      password: "Mật khẩu",
      confirmPassword: "Xác nhận Mật khẩu",
    };

    return (
      nameMap[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  };

  const getInputType = (fieldName: string): string => {
    if (fieldName.toLowerCase().includes("password")) return "password";
    if (fieldName.toLowerCase().includes("email")) return "email";
    return "text";
  };

  return (
    <form
      id={formId}
      // @ts-expect-error - Generic type constraint between form and handler
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-8"
    >
      <div className="flex flex-col items-end gap-1">
        <FieldGroup className="gap-4">
          {Object.keys(defaultValues).map((field) => (
            <Controller
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex w-full flex-col gap-2"
                >
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-base font-semibold"
                  >
                    {formatFieldName(field.name)}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type={getInputType(field.name)}
                    className="min-h-12 border text-base"
                    aria-invalid={fieldState.invalid}
                    autoComplete={
                      field.name.includes("password")
                        ? "current-password"
                        : "off"
                    }
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </FieldGroup>

        {formType === "LOGIN" && (
          <Link
            to={AUTH_ROUTES.FORGOT_PASSWORD}
            className="text-primary text-sm underline underline-offset-2"
          >
            Quên mật khẩu?
          </Link>
        )}
      </div>

      <Button
        type="submit"
        className="min-h-12 w-full cursor-pointer text-xl"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && <Spinner />}
        {form.formState.isSubmitting
          ? buttonText === "Đăng nhập"
            ? "Đang đăng nhập..."
            : "Đang đăng ký..."
          : buttonText}
      </Button>
    </form>
  );
};

export default AuthForm;
