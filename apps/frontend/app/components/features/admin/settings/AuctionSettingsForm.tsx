import { zodResolver } from "@hookform/resolvers/zod";
import type { AuctionSettings } from "@repo/shared-types";
import { Clock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  updateAuctionSettingsSchema,
  type UpdateAuctionSettingsFormData,
} from "@/lib/validations/admin.validation";

type AuctionSettingsFormProps = {
  settings: AuctionSettings;
  onUpdate: (data: {
    extendThresholdMinutes: number;
    extendDurationMinutes: number;
  }) => Promise<void>;
};

export const AuctionSettingsForm = ({
  settings,
  onUpdate,
}: AuctionSettingsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateAuctionSettingsFormData>({
    resolver: zodResolver(updateAuctionSettingsSchema),
    defaultValues: {
      extendThresholdMinutes: settings.extendThresholdMinutes,
      extendDurationMinutes: settings.extendDurationMinutes,
    },
  });

  // Reset form when settings change
  useEffect(() => {
    form.reset({
      extendThresholdMinutes: settings.extendThresholdMinutes,
      extendDurationMinutes: settings.extendDurationMinutes,
    });
  }, [settings, form]);

  const handleSubmit = async (data: UpdateAuctionSettingsFormData) => {
    setIsSubmitting(true);
    try {
      await onUpdate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded">
            <Clock className="text-primary h-4 w-4" />
          </div>
          <div>
            <CardTitle>Cài đặt tự động gia hạn đấu giá</CardTitle>
            <CardDescription>
              Điều chỉnh các thông số gia hạn tự động khi có đặt giá mới trong
              những phút cuối
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              <Controller
                name="extendThresholdMinutes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="extend-threshold">
                      Ngưỡng gia hạn (phút)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="extend-threshold"
                      type="number"
                      placeholder="5"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FieldDescription>
                      Ngưỡng kích hoạt gia hạn khi có lượt đặt giá mới (1-30
                      phút)
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="extendDurationMinutes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="extend-duration">
                      Thời gian gia hạn (phút)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="extend-duration"
                      type="number"
                      placeholder="10"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FieldDescription>
                      Thời gian được gia hạn thêm khi có lượt đặt giá mới (1-60
                      phút)
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="mb-2 font-medium">Cách hoạt động:</h4>
              <ul className="text-muted-foreground space-y-1 pl-5 text-sm">
                <li>
                  Khi có lượt đặt giá mới và thời gian còn lại ≤{" "}
                  <span className="font-medium">
                    {form.watch("extendThresholdMinutes")} phút
                  </span>
                </li>
                <li>
                  Hệ thống sẽ tự động gia hạn thêm{" "}
                  <span className="font-medium">
                    {form.watch("extendDurationMinutes")} phút
                  </span>
                </li>
                <li>
                  Điều này giúp những người tham gia khác có đủ thời gian để
                  phản hồi
                </li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save />
                    Lưu cài đặt
                  </>
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
