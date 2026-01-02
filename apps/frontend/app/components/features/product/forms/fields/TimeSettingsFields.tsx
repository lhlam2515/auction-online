import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeSettingsFieldsProps<T extends FieldValues> {
  control: Control<T>;
}

const TimeSettingsFields = <T extends FieldValues>({
  control,
}: TimeSettingsFieldsProps<T>) => {
  return (
    <FieldGroup className="gap-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Controller
          control={control}
          name={"endTime" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Thời gian kết thúc <span className="text-red-500">*</span>
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id={field.name}
                    variant="outline"
                    className={cn(
                      "min-h-12 w-full justify-start pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value as Date, "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })
                    ) : (
                      <span>Chọn ngày và giờ</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value as Date}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const todayAtMidnight = new Date();
                      todayAtMidnight.setHours(0, 0, 0, 0);
                      return date < todayAtMidnight;
                    }}
                    autoFocus
                  />
                  <div className="border-border border-t p-3">
                    <Label>Thời gian</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      step="60"
                      placeholder="HH:MM"
                      defaultValue={
                        field.value
                          ? (field.value as Date).toTimeString().slice(0, 5)
                          : ""
                      }
                      onChange={(e) => {
                        if (field.value && e.target.value) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value as Date);
                          newDate.setHours(
                            parseInt(hours, 10),
                            parseInt(minutes, 10)
                          );
                          field.onChange(newDate);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FieldDescription>Thời gian đấu giá sẽ kết thúc</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name={"isAutoExtend" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col gap-2"
            >
              <div className="flex flex-row items-start space-y-0 space-x-3 rounded-md bg-green-50 p-4">
                <Checkbox
                  id={field.name}
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
                <div className="space-y-1 leading-none">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-base font-medium"
                  >
                    Tự động gia hạn
                  </FieldLabel>
                  <FieldDescription>
                    Tự động gia hạn thời gian nếu có người đặt giá trong những
                    phút cuối
                  </FieldDescription>
                </div>
              </div>
            </Field>
          )}
        />
      </div>
    </FieldGroup>
  );
};

export default TimeSettingsFields;
