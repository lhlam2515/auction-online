import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import { useEffect } from "react";
import {
  Controller,
  type DefaultValues,
  type FieldValues,
  type Path,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SUCCESS_MESSAGES } from "@/constants/api";
import { getErrorMessage, showError } from "@/lib/handlers/error";

interface UserProfileFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  isLoading?: boolean;
}

const UserProfileForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  isLoading = false,
}: UserProfileFormProps<T>) => {
  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  // Reset form when defaultValues change
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      form.clearErrors();

      const result = (await onSubmit(data)) as ApiResponse;

      if (!result.success) {
        toast.error(
          result.error?.message || "Lỗi khi cập nhật thông tin cá nhân"
        );
        return;
      }

      toast.success(SUCCESS_MESSAGES.UPDATE_PROFILE);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      form.setError("root", { message: errorMessage });

      showError(error, errorMessage);
    }
  };

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      fullName: "Họ và Tên",
      email: "Email",
      birthDate: "Ngày Sinh",
      address: "Địa Chỉ",
    };

    return nameMap[fieldName] || fieldName;
  };

  const getInputType = (fieldName: string): string => {
    if (fieldName === "email") return "email";
    if (fieldName === "birthDate") return "date";
    return "text";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
        <span className="ml-2">Đang tải thông tin...</span>
      </div>
    );
  }

  return (
    <form
      id="user-profile-form"
      // @ts-expect-error - Generic type constraint between form and handler
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-8"
      noValidate
    >
      {form.formState.errors.root && (
        <div className="error-message">
          <p>{form.formState.errors.root.message}</p>
        </div>
      )}
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
                  value={
                    field.name === "birthDate" &&
                    (field.value as any) instanceof Date
                      ? (field.value as Date).toISOString().split("T")[0]
                      : field.value || ""
                  }
                  onChange={(e) => {
                    if (field.name === "birthDate") {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    } else {
                      field.onChange(e);
                    }
                  }}
                  className="border text-base"
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
        className="cursor-pointer"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && <Spinner />}
        {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
      </Button>
    </form>
  );
};

export default UserProfileForm;
