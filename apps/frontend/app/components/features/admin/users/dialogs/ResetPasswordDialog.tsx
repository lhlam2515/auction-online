import { Key } from "lucide-react";
import { useState } from "react";

import { UserAvatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { ResetPasswordForm } from "../forms";
import { useResetPasswordForm } from "../hooks";

type ResetPasswordDialogProps = {
  userId: string;
  userName?: string;
  userEmail?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

const ResetPasswordDialog = ({
  userId,
  userName,
  userEmail,
  trigger,
  onSuccess,
}: ResetPasswordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    form,
    newPassword,
    confirmPassword,
    passwordRequirements,
    allRequirementsMet,
    submitResetPassword,
  } = useResetPasswordForm({
    userId,
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsConfirming(true);
      await submitResetPassword();
    } catch {
      // Error already handled in hook
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Key className="mr-1 h-4 w-4" />
            Đặt lại mật khẩu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Đặt lại mật khẩu người dùng
          </DialogTitle>
          <DialogDescription>
            Thiết lập mật khẩu mới cho tài khoản người dùng
          </DialogDescription>
        </DialogHeader>

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
              </div>
            </div>
            <Separator />
          </>
        )}

        <ResetPasswordForm
          form={form}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          passwordRequirements={passwordRequirements}
          allRequirementsMet={allRequirementsMet}
          onCancel={() => setOpen(false)}
          onSubmit={handleConfirmSubmit}
          isSubmitting={isConfirming}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
