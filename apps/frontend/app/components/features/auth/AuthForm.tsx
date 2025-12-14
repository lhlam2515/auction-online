import type { ApiResponse } from "@repo/shared-types";
import { FormProvider, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SUCCESS_MESSAGES } from "@/constants/api";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useAuthNavigation } from "@/hooks/useAuthNavigation";

import AuthFormFields from "./AuthFormFields";
interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  formType: "LOGIN" | "REGISTER";
}

const AuthForm = <T extends FieldValues>(props: AuthFormProps<T>) => {
  const { formType, defaultValues } = props;
  const { navigateAfterSuccess, navigateAfterError } = useAuthNavigation({
    formType,
  });
  const { form, handleSubmit, isSubmitting, errors } = useAuthForm({
    ...props,
    onSuccess: (data, result) => {
      toast.success(
        props.formType === "LOGIN"
          ? SUCCESS_MESSAGES.LOGIN
          : SUCCESS_MESSAGES.REGISTER
      );

      if (props.formType === "LOGIN") {
        const { user } = result.data;
        navigateAfterSuccess(user);
      } else {
        navigateAfterSuccess();
      }
    },
    onError: (error, errorMessage) => {
      navigateAfterError(errorMessage);
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

        <div className="flex flex-col items-end gap-1">
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
        </div>
      </form>
    </FormProvider>
  );
};

export default AuthForm;
