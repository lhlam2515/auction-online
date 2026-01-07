import { UserPlus } from "lucide-react";
import { useState } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import CreateUserFormFields from "./CreateUserFormFields";

type CreateUserFormData = {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: "BIDDER" | "SELLER" | "ADMIN";
  address?: string;
  birthDate?: string;
};

type CreateUserFormProps = {
  form: UseFormReturn<CreateUserFormData>;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
};

const CreateUserForm = ({
  form,
  onCancel,
  onSubmit,
  isSubmitting,
  isFormValid,
}: CreateUserFormProps) => {
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

  const defaultValues = form.getValues();

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {form.formState.errors.root && (
          <AlertSection
            variant="destructive"
            description={form.formState.errors.root.message}
          />
        )}

        <CreateUserFormFields
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isConfirming}
          >
            Hủy
          </Button>
          <ConfirmationDialog
            trigger={
              <Button
                type="button"
                disabled={isSubmitting || !isFormValid || isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Spinner className="mr-1 h-4 w-4" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1 h-4 w-4" />
                    Tạo tài khoản
                  </>
                )}
              </Button>
            }
            title="Xác nhận tạo tài khoản"
            description={
              <div className="space-y-3">
                <p>
                  Bạn có chắc chắn muốn tạo tài khoản mới với thông tin sau?
                </p>
                <div className="bg-muted space-y-2 rounded-md p-3 text-sm">
                  <p>
                    <b>Email:</b> {defaultValues.email}
                  </p>
                  <p>
                    <b>Tên đăng nhập:</b> {defaultValues.username}
                  </p>
                  <p>
                    <b>Họ và tên:</b> {defaultValues.fullName}
                  </p>
                  <p>
                    <b>Vai trò:</b> {defaultValues.role}
                  </p>
                </div>
                <p className="text-muted-foreground italics text-sm">
                  Thông tin đăng nhập sẽ được gửi đến email của người dùng.
                </p>
              </div>
            }
            variant="default"
            confirmLabel="Xác nhận tạo"
            confirmIcon={UserPlus}
            onConfirm={handleConfirmSubmit}
            isConfirming={isConfirming}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateUserForm;
