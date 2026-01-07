import { UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CreateUserForm } from "../forms";
import { useCreateUserForm } from "../hooks";

type CreateUserDialogProps = {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

const CreateUserDialog = ({ trigger, onSuccess }: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { form, isFormValid, submitCreateUser, resetForm } = useCreateUserForm({
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
      await submitCreateUser();
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
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Tạo tài khoản mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tạo tài khoản người dùng mới
          </DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo tài khoản mới cho người dùng
          </DialogDescription>
        </DialogHeader>

        <CreateUserForm
          form={form}
          onCancel={() => setOpen(false)}
          onSubmit={handleConfirmSubmit}
          isSubmitting={isConfirming}
          isFormValid={isFormValid}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
