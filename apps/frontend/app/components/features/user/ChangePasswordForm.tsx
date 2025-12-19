import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import {
  Controller,
  type DefaultValues,
  type FieldValues,
  type Path,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
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

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
}

const ChangePasswordForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
}: AuthFormProps<T>) => {
  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      const result = await onSubmit(data);

      if (result?.success) {
        toast.success(SUCCESS_MESSAGES.CHANGE_PASSWORD);
      } else {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      currentPassword: "Mật khẩu cũ",
      newPassword: "Mật khẩu mới",
      confirmPassword: "Xác nhận Mật khẩu",
    };

    return (
      nameMap[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  };

  const getInputType = (fieldName: string): string => {
    if (fieldName.toLowerCase().includes("password")) return "password";

    return "text";
  };

  return (
    <form
      id="changePassword"
      // @ts-expect-error - Generic type constraint between form and handler
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-8 p-4"
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
      </div>

      <Button
        type="submit"
        className="min-h-12 w-full cursor-pointer text-xl"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && <Spinner />}
        {form.formState.isSubmitting ? "Đang đổi mật khẩu" : "Đổi mật khẩu"}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
