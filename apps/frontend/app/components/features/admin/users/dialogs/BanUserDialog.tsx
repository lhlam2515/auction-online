import { zodResolver } from "@hookform/resolvers/zod";
import type { BanUserRequest } from "@repo/shared-types";
import { Ban, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { UserAvatar } from "@/components/common";
import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { banUserSchema } from "@/lib/validations/admin.validation";

type BanUserForm = z.infer<typeof banUserSchema>;

type BanUserDialogProps = {
  userId: string;
  userName?: string;
  userEmail?: string;
  currentStatus?: "ACTIVE" | "BANNED" | "PENDING_VERIFICATION";
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

const BanUserDialog = ({
  userId,
  userName,
  userEmail,
  currentStatus,
  trigger,
  onSuccess,
}: BanUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Nếu đã ban rồi thì defaultValues là unban (isBanned = false)
  // Nếu chưa ban thì defaultValues là ban (isBanned = true)
  const form = useForm<BanUserForm>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      isBanned: currentStatus !== "BANNED",
      reason: "",
      duration: 0,
    },
  });

  const isBanned = form.watch("isBanned");
  const reason = form.watch("reason");
  const duration = form.watch("duration");

  const handleConfirmSubmit = async () => {
    const data = form.getValues();

    try {
      setIsConfirming(true);
      form.clearErrors();

      const updateData: BanUserRequest = {
        isBanned: data.isBanned,
        reason: data.isBanned ? data.reason : undefined,
        duration: data.isBanned ? data.duration : undefined,
      };

      const response = await api.admin.users.ban(userId, updateData);

      if (!response.success) {
        throw new Error(
          response.error?.message || "Lỗi khi cập nhật trạng thái ban"
        );
      }

      toast.success(
        data.isBanned
          ? "Đã ban người dùng thành công!"
          : "Đã gỡ ban người dùng thành công!"
      );
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Lỗi khi cập nhật trạng thái ban"
      );
      form.setError("root", { message: errorMessage });
      showError(err, errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset({
        isBanned: currentStatus !== "BANNED",
        reason: "",
        duration: 0,
      });
    }
  };

  const isFormValid =
    !isBanned || (reason && reason.length >= 10 && duration !== undefined);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Ban className="mr-2 h-4 w-4" />
            Quản lý trạng thái Ban
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Quản lý trạng thái Ban người dùng
          </DialogTitle>
          <DialogDescription>
            Cấm hoặc gỡ cấm người dùng khỏi hệ thống
          </DialogDescription>
        </DialogHeader>

        {/* User Info Preview */}
        {(userName || userEmail) && (
          <>
            <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
              <UserAvatar
                name={userName || userEmail || "User"}
                className="h-10 w-10"
              />
              <div className="flex-1">
                {userName && <p className="text-sm font-medium">{userName}</p>}
                {userEmail && (
                  <p className="text-muted-foreground text-xs">{userEmail}</p>
                )}
                {currentStatus && (
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      currentStatus === "BANNED"
                        ? "bg-red-100 text-red-800"
                        : currentStatus === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {currentStatus === "BANNED"
                      ? "Đã bị cấm"
                      : currentStatus === "ACTIVE"
                        ? "Đang hoạt động"
                        : "Chờ xác thực"}
                  </span>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          {form.formState.errors.root && (
            <AlertSection
              variant="destructive"
              description={form.formState.errors.root.message}
            />
          )}

          <FieldGroup className="gap-4">
            {/* Ban/Unban Selection */}
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
                      className={`flex items-center space-x-3 ${
                        currentStatus === "BANNED"
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <RadioGroupItem
                        value="ban"
                        id="ban"
                        disabled={currentStatus === "BANNED"}
                      />
                      <label
                        htmlFor="ban"
                        className={`flex items-center gap-2 text-sm font-medium ${
                          currentStatus === "BANNED"
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <Ban className="h-4 w-4 text-red-600" />
                        <span>Cấm người dùng (Ban)</span>
                        {currentStatus === "BANNED" && (
                          <span className="text-xs text-gray-500">
                            (Đã bị cấm)
                          </span>
                        )}
                      </label>
                    </div>
                    <div
                      className={`flex items-center space-x-3 ${
                        currentStatus !== "BANNED"
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <RadioGroupItem
                        value="unban"
                        id="unban"
                        disabled={currentStatus !== "BANNED"}
                      />
                      <label
                        htmlFor="unban"
                        className={`flex items-center gap-2 text-sm font-medium ${
                          currentStatus !== "BANNED"
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
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

            {/* Warning when banning */}
            {isBanned && (
              <AlertSection
                variant="warning"
                icon={AlertTriangle}
                title="Cảnh báo"
                description="Người dùng bị cấm sẽ không thể đăng nhập vào hệ thống. Tất cả phiên đăng nhập hiện tại của họ sẽ bị vô hiệu hóa."
              />
            )}

            {/* Info when unbanning */}
            {!isBanned && currentStatus === "BANNED" && (
              <AlertSection
                variant="info"
                icon={Info}
                title="Thông tin"
                description="Gỡ cấm sẽ cho phép người dùng đăng nhập trở lại hệ thống."
              />
            )}

            {/* Reason field (required when banning) */}
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
                        className={`font-medium ${
                          (field.value?.length || 0) < 10
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
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

            {/* Duration field (optional when banning) */}
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
                          Người dùng sẽ bị cấm trong {duration} ngày kể từ bây
                          giờ
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
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  disabled={!isFormValid || isConfirming}
                  className="cursor-pointer"
                  variant={isBanned ? "destructive" : "default"}
                >
                  {isBanned ? (
                    <>
                      <Ban className="h-4 w-4" />
                      Xác nhận cấm
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4" />
                      Xác nhận gỡ cấm
                    </>
                  )}
                </Button>
              }
              title={isBanned ? "Xác nhận cấm người dùng" : "Xác nhận gỡ cấm"}
              description={
                <div className="space-y-3">
                  <p>
                    {isBanned
                      ? "Bạn có chắc chắn muốn cấm người dùng này?"
                      : "Bạn có chắc chắn muốn gỡ cấm cho người dùng này?"}
                  </p>
                  {(userName || userEmail) && (
                    <div className="rounded-md bg-gray-50 p-3">
                      {userName && (
                        <p className="text-sm">
                          <strong>Người dùng:</strong> {userName}
                        </p>
                      )}
                      {userEmail && (
                        <p className="text-sm">
                          <strong>Email:</strong> {userEmail}
                        </p>
                      )}
                      {isBanned && reason && (
                        <p className="text-sm">
                          <strong>Lý do:</strong> {reason}
                        </p>
                      )}
                      {isBanned && duration !== undefined && (
                        <p className="text-sm">
                          <strong>Thời gian:</strong>{" "}
                          {duration === 0 ? "Vĩnh viễn" : `${duration} ngày`}
                        </p>
                      )}
                    </div>
                  )}
                  {isBanned && (
                    <AlertSection
                      variant="warning"
                      description="Người dùng sẽ bị đăng xuất ngay lập tức và không thể đăng nhập cho đến khi được gỡ cấm."
                    />
                  )}
                </div>
              }
              variant={isBanned ? "destructive" : "default"}
              confirmLabel={isBanned ? "Xác nhận cấm" : "Xác nhận gỡ cấm"}
              confirmIcon={isBanned ? Ban : ShieldAlert}
              onConfirm={handleConfirmSubmit}
              isConfirming={isConfirming}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserDialog;
