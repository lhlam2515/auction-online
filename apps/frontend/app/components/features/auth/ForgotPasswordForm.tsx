import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import {
  FormProvider,
  useForm,
  Controller,
  type FieldValues,
  type DefaultValues,
  type SubmitHandler,
  type Path,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";
interface ForgotPasswordFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "REQUEST_OTP" | "RESET_PASSWORD";
  onSuccess?: (data: T, res?: ApiResponse) => void;
  onError?: () => void;
}

const ForgotPasswordForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  formType,
  onSuccess,
  onError,
}: ForgotPasswordFormProps<T>) => {
  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      form.clearErrors();

      const result = (await onSubmit(data)) as ApiResponse;

      if (!result.success) {
        logger.error("ForgotPasswordForm handleSubmit error:", result.error);
        throw new Error(result.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      const successMessage =
        formType === "REQUEST_OTP"
          ? SUCCESS_MESSAGES.FORGOT_PASSWORD
          : SUCCESS_MESSAGES.RESET_PASSWORD;

      toast.success(result.message || successMessage);

      // Call onSuccess callback if provided
      onSuccess?.(data, result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      // Set form error
      form.setError("root", {
        message: errorMessage,
      });

      // Show error notification
      showError(error, errorMessage);

      // Call onError callback if provided
      onError?.();
    }
  };

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      email: "Địa chỉ Email",
      newPassword: "Mật khẩu mới",
      confirmNewPassword: "Xác nhận Mật khẩu mới",
    };

    return nameMap[fieldName] || fieldName;
  };

  const getInputType = (fieldName: string): string => {
    if (fieldName.toLowerCase().includes("password")) return "password";
    return "email";
  };

  const buttonText = formType === "REQUEST_OTP" ? "Gửi OTP" : "Đổi mật khẩu";
  const loadingText =
    formType === "REQUEST_OTP" ? "Đang gửi..." : "Đang đổi...";

  return (
    <FormProvider {...form}>
      <form
        id="forgot-password-form"
        // @ts-expect-error - Generic type constraint between form and handler
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        noValidate
      >
        {form.formState.errors.root && (
          <div className="error-message">
            <p>{form.formState.errors.root.message}</p>
          </div>
        )}
        <FieldGroup className="gap-4">
          {Object.keys(defaultValues)
            .filter((field) =>
              formType === "REQUEST_OTP" ? field === "email" : field !== "email"
            )
            .map((field) => (
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

        <Button
          type="submit"
          className="min-h-12 w-full text-xl"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Spinner />}
          {form.formState.isSubmitting ? loadingText : buttonText}
        </Button>
      </form>
    </FormProvider>
  );
};

export default ForgotPasswordForm;
