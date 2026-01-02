import { zodResolver } from "@hookform/resolvers/zod";
import type { CategoryTree } from "@repo/shared-types";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  updateCategorySchema,
  type UpdateCategoryFormData,
} from "@/lib/validations/category.validation";

type EditCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryTree;
  onUpdate: (categoryId: string, data: { name: string }) => Promise<void>;
};

const EditCategoryDialog = ({
  open,
  onOpenChange,
  category,
  onUpdate,
}: EditCategoryDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category.name,
      });
    }
  }, [open, category.name, form]);

  const handleSubmit = async (data: UpdateCategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onUpdate(category.id, { name: data.name });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({ name: category.name }); // Reset to original name
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Chỉnh sửa danh mục
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa tên danh mục <b>{category.name}</b>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên danh mục <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên danh mục..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !form.formState.isValid ||
                  form.watch("name") === category.name
                }
                className="cursor-pointer"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
