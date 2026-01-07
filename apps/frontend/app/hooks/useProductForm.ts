import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import { useCallback, useState } from "react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type { ZodType } from "zod";

import { getErrorMessage } from "@/lib/handlers/error";
import logger from "@/lib/logger";

interface UseProductFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  onSuccess?: (data: T, result: ApiResponse, message: string) => void;
  onError?: (data: T, error: unknown, errorMessage: string) => void;
}

export function useProductForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  onError,
}: UseProductFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    // Type assertion needed for generic Zod schema with react-hook-form
    // @ts-expect-error - Generic type constraint incompatibility between Zod and react-hook-form
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit = useCallback(
    async (data: T) => {
      setIsSubmitting(true);

      try {
        const result = await onSubmit(data);

        if (result.success) {
          const message = result.message || "Thao tác thành công";
          onSuccess?.(data, result, message);
        } else {
          const errorMessage = result.error?.message || "Có lỗi xảy ra";
          onError?.(data, result.error, errorMessage);
        }
      } catch (error) {
        logger.error("Form submission error:", error);
        const errorMessage = getErrorMessage(error);
        onError?.(data, error, errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError]
  );

  return {
    form,
    handleSubmit,
    isSubmitting,
    errors: form.formState.errors,
  };
}
