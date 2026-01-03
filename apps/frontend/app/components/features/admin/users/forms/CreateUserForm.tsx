import { UserPlus } from "lucide-react";
import { FormProvider, type UseFormReturn } from "react-hook-form";

import { AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";

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
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid}
            className="gap-2"
          >
            {isSubmitting ? (
              <>Đang tạo...</>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Tạo tài khoản
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateUserForm;
