import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse } from "@repo/shared-types";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  useForm,
  Controller,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  type Path,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { cn } from "@/lib/utils";

interface RatingFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  onSuccess?: () => void;
  onSkip?: () => void;
}

const RatingForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  onSkip,
}: RatingFormProps<T>) => {
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
        throw new Error(result.error?.message || "Lỗi khi gửi đánh giá");
      }

      toast.success("Đánh giá của bạn đã được gửi thành công!");
      onSuccess?.();
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Lỗi khi gửi đánh giá");

      form.setError("root", { message: errorMessage });

      showError(error, errorMessage);
    }
  };

  return (
    <form
      id="rating-form"
      // @ts-expect-error - Generic type constraint between form and handler
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
    >
      {form.formState.errors.root && (
        <div className="error-message">
          <p>{form.formState.errors.root.message}</p>
        </div>
      )}
      <FieldGroup className="gap-4">
        {/* Rating Field */}
        <Controller
          control={form.control}
          name={"rating" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Đánh giá của bạn
              </FieldLabel>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={field.value === 1 ? "default" : "outline"}
                  size="lg"
                  className={cn("h-24 flex-col gap-2", {
                    "bg-emerald-600 text-emerald-50 hover:bg-emerald-300 hover:text-emerald-600":
                      field.value === 1,
                    "border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-600":
                      field.value !== 1,
                  })}
                  onClick={() => field.onChange(1)}
                >
                  <ThumbsUp className="h-8 w-8" />
                  <span className="font-semibold">Tích cực (+1)</span>
                </Button>

                <Button
                  type="button"
                  variant={field.value === -1 ? "default" : "outline"}
                  size="lg"
                  className={cn("h-24 flex-col gap-2", {
                    "bg-red-600 text-red-50 hover:bg-red-300 hover:text-red-600":
                      field.value === -1,
                    "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-600":
                      field.value !== -1,
                  })}
                  onClick={() => field.onChange(-1)}
                >
                  <ThumbsDown className="h-8 w-8" />
                  <span className="font-semibold">Tiêu cực (-1)</span>
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Comment Field */}
        <Controller
          control={form.control}
          name={"comment" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-medium text-slate-900"
              >
                Nhận xét (Tùy chọn)
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                rows={5}
                className="resize-none"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Nhận xét của bạn sẽ giúp người dùng khác đưa ra quyết định tốt
                hơn.
              </FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={form.formState.isSubmitting}
        >
          Bỏ qua
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner />}
          {form.formState.isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </div>
    </form>
  );
};

export default RatingForm;
