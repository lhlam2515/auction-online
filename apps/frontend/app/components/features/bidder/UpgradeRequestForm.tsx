import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@radix-ui/react-checkbox";
import type { ApiResponse } from "@repo/shared-types";
import { Store, Badge } from "lucide-react";
import { useEffect, useState } from "react";
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
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { useAuth } from "@/contexts/auth-provider";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
}

const UpgradeRequestForm = <T extends FieldValues>({
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
        toast.success(SUCCESS_MESSAGES.UPGRADE_SELLER);
      } else {
        toast.error(result?.message || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      reason: "Lý do bạn muốn trở thành người bán là gì ?",
      agreedToTerms:
        "Bạn có đồng ý với các điều khoản khi trở thành người bán ?",
    };

    return (
      nameMap[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  };

  const getInputType = (
    fieldName: string
  ): "text" | "checkbox" | "textarea" => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes("reason")) return "textarea";
    if (lowerName.includes("agreed") || lowerName.includes("term"))
      return "checkbox";
    return "text";
  };

  const [sellerRequestStatus, setSellerRequestStatus] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === "SELLER") {
      setSellerRequestStatus(false);
    }
  }, []);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-slate-900" />
            <CardTitle>Nâng Cấp Thành Người Bán</CardTitle>{" "}
          </div>
        </div>
        <CardDescription>
          Yêu cầu quyền bán hàng trên nền tảng đấu giá
        </CardDescription>
      </CardHeader>
      {sellerRequestStatus && (
        <form
          id="upgradeRequestForm"
          // @ts-expect-error - Generic type constraint
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 p-4"
        >
          <div className="flex flex-col gap-1">
            <FieldGroup className="gap-6">
              {Object.keys(defaultValues).map((fieldKey) => {
                const fieldName = fieldKey as Path<T>;
                const inputType = getInputType(fieldName);

                return (
                  <Controller
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="flex w-full flex-col gap-2"
                      >
                        {inputType === "checkbox" ? (
                          <div className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 shadow-sm">
                            <Checkbox
                              id={field.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <div className="space-y-1 leading-none">
                              <FieldLabel
                                htmlFor={field.name}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {formatFieldName(field.name)}
                              </FieldLabel>
                            </div>
                          </div>
                        ) : inputType === "textarea" ? (
                          <>
                            <FieldLabel
                              htmlFor={field.name}
                              className="text-base font-semibold"
                            >
                              {formatFieldName(field.name)}
                            </FieldLabel>
                            <Textarea
                              {...field}
                              id={field.name}
                              className="min-h-[100px] text-base"
                              aria-invalid={fieldState.invalid}
                            />
                          </>
                        ) : (
                          <>
                            <FieldLabel
                              htmlFor={field.name}
                              className="text-base font-semibold"
                            >
                              {formatFieldName(field.name)}
                            </FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              type={inputType}
                              className="min-h-12 border text-base"
                              aria-invalid={fieldState.invalid}
                              required={inputType !== "text"} // Tùy chỉnh required
                            />
                          </>
                        )}

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                );
              })}
            </FieldGroup>
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full cursor-pointer text-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Spinner />}
            {form.formState.isSubmitting ? "Đang gửi yêu cầu" : "Gửi yêu cầu"}
          </Button>
        </form>
      )}
      {!sellerRequestStatus && (
        <CardHeader>
          <CardDescription>Bạn đã là người bán</CardDescription>
        </CardHeader>
      )}
    </Card>
  );
};

export default UpgradeRequestForm;
