import { Ban, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { UserAvatar } from "@/components/common";
import { AccountStatusBadge } from "@/components/common/badges";
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

import { BanUserForm } from "../forms";
import { useBanUserForm } from "../hooks";

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

  const {
    form,
    isBanned,
    reason,
    duration,
    isFormValid,
    submitBanUser,
    resetForm,
  } = useBanUserForm({
    userId,
    currentStatus,
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsConfirming(true);
      await submitBanUser();
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
            <Ban className="mr-1 h-4 w-4" />
            Quản lý trạng thái Ban
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Quản lý trạng thái Ban người dùng
          </DialogTitle>
          <DialogDescription>
            Cấm hoặc gỡ cấm người dùng khỏi hệ thống
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
                {currentStatus && (
                  <AccountStatusBadge status={currentStatus} className="mt-1" />
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        <BanUserForm
          form={form}
          isBanned={isBanned}
          reason={reason}
          duration={duration}
          currentStatus={currentStatus}
          onCancel={() => setOpen(false)}
          onSubmit={handleConfirmSubmit}
          isSubmitting={isConfirming}
          isFormValid={isFormValid}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BanUserDialog;
