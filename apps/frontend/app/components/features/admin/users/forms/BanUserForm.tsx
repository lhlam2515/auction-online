import { Ban, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BanUserFormData = {
  isBanned: boolean;
  reason: string;
  duration?: number;
};

type BanUserFormProps = {
  form: UseFormReturn<BanUserFormData>;
  isBanned: boolean;
  reason: string;
  duration?: number;
  currentStatus?: "ACTIVE" | "BANNED" | "PENDING_VERIFICATION";
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
};

const BanUserForm = ({
  form,
  isBanned,
  duration,
  currentStatus,
  onCancel,
  onSubmit,
  isSubmitting,
  isFormValid,
}: BanUserFormProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsConfirming(true);
      await onSubmit();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      {form.formState.errors.root && (
        <AlertSection
          variant="destructive"
          description={form.formState.errors.root.message}
        />
      )}

      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="isBanned"
          render={({ field }) => (
            <Field className="flex w-full flex-col gap-3">
              <FieldLabel className="text-sm font-semibold">
                Hành động <span className="text-red-500">*</span>
              </FieldLabel>
              <RadioGroup
                value={field.value ? "ban" : "unban"}
                onValueChange={(value) => field.onChange(value === "ban")}
                className="space-y-3"
                disabled
              >
                <div
                  className={cn(
                    "flex items-center space-x-3",
                    currentStatus === "BANNED" &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <RadioGroupItem
                    value="ban"
                    id="ban"
                    disabled={currentStatus === "BANNED"}
                  />
                  <label
                    htmlFor="ban"
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      currentStatus === "BANNED"
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    )}
                  >
                    <Ban className="h-4 w-4 text-red-600" />
                    <span>Cấm người dùng (Ban)</span>
                    {currentStatus === "BANNED" && (
                      <span className="text-xs text-gray-500">(Đã bị cấm)</span>
                    )}
                  </label>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3",
                    currentStatus !== "BANNED" &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <RadioGroupItem
                    value="unban"
                    id="unban"
                    disabled={currentStatus !== "BANNED"}
                  />
                  <label
                    htmlFor="unban"
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      currentStatus !== "BANNED"
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    )}
                  >
                    <ShieldAlert className="h-4 w-4 text-green-600" />
                    <span>Gỡ cấm người dùng (Unban)</span>
                    {currentStatus !== "BANNED" && (
                      <span className="text-xs text-gray-500">
                        (Chưa bị cấm)
                      </span>
                    )}
                  </label>
                </div>
              </RadioGroup>
            </Field>
          )}
        />

        {isBanned && (
          <AlertSection
            variant="warning"
            icon={AlertTriangle}
            title="Cảnh báo"
            description="Người dùng bị cấm sẽ không thể đăng nhập vào hệ thống. Tất cả phiên đăng nhập hiện tại của họ sẽ bị vô hiệu hóa."
          />
        )}

        {!isBanned && currentStatus === "BANNED" && (
          <AlertSection
            variant="info"
            icon={Info}
            title="Thông tin"
            description="Gỡ cấm sẽ cho phép người dùng đăng nhập trở lại hệ thống."
          />
        )}

        {isBanned && (
          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-semibold"
                >
                  Lý do cấm <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  className="min-h-[100px] resize-none border"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nhập lý do cấm người dùng này (tối thiểu 10 ký tự)"
                  required
                />
                <FieldDescription className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Lý do sẽ được ghi lại trong hệ thống
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      (field.value?.length || 0) < 10
                        ? "text-red-500"
                        : "text-green-600"
                    )}
                  >
                    {field.value?.length || 0}/10
                  </span>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        {isBanned && (
          <Controller
            control={form.control}
            name="duration"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex w-full flex-col gap-2"
              >
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-semibold"
                >
                  Thời gian cấm (ngày)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="0"
                  className="border"
                  aria-invalid={fieldState.invalid}
                  placeholder="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <FieldDescription className="text-muted-foreground text-xs">
                  {duration === 0 || duration === undefined ? (
                    <span className="font-medium text-red-600">
                      0 ngày = cấm vĩnh viễn
                    </span>
                  ) : (
                    <span>
                      Người dùng sẽ bị cấm trong {duration} ngày kể từ bây giờ
                    </span>
                  )}
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isConfirming}
          className="cursor-pointer"
        >
          Hủy
        </Button>
        <ConfirmationDialog
          trigger={
            <Button
              type="button"
              disabled={!isFormValid || isSubmitting || isConfirming}
              variant={isBanned ? "destructive" : "default"}
              className="cursor-pointer"
            >
              {isBanned ? (
                <>
                  <Ban className="h-4 w-4" />
                  {isConfirming ? "Đang xử lý..." : "Xác nhận cấm"}
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  {isConfirming ? "Đang xử lý..." : "Xác nhận gỡ cấm"}
                </>
              )}
            </Button>
          }
          title={
            isBanned ? "Xác nhận cấm người dùng" : "Xác nhận gỡ cấm người dùng"
          }
          description={
            <div className="space-y-3">
              <p>
                {isBanned
                  ? "Bạn có chắc chắn muốn CẤM người dùng này? Họ sẽ không thể đăng nhập và tất cả hoạt động sẽ bị vô hiệu hóa."
                  : "Bạn có chắc chắn muốn GỠ CẤM người dùng này? Họ sẽ có thể đăng nhập trở lại."}
              </p>
              {isBanned && form.watch("reason") && (
                <ul className="bg-muted space-y-2 rounded-md p-3 text-sm">
                  <li>
                    <b>Lý do:</b> {form.watch("reason")}
                  </li>
                  <li>
                    <b>Thời gian:</b>{" "}
                    {duration ? `${duration} ngày` : "Vĩnh viễn"}
                  </li>
                </ul>
              )}
            </div>
          }
          variant={isBanned ? "danger" : "default"}
          confirmLabel={isBanned ? "Xác nhận cấm" : "Xác nhận gỡ cấm"}
          confirmIcon={isBanned ? Ban : ShieldAlert}
          onConfirm={handleConfirmSubmit}
          isConfirming={isConfirming}
        />
      </div>
    </form>
  );
};

export default BanUserForm;
