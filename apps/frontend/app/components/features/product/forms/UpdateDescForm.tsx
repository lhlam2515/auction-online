import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateDescriptionRequest } from "@repo/shared-types";
import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  RichTextEditor,
  type RichTextEditorRef,
} from "@/components/ui/rich-text-editor";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import {
  descriptionUpdateSchema,
  type DescriptionUpdateSchemaType,
} from "@/lib/validations/product.validation";

interface UpdateDescFormProps {
  productId: string;
  onSuccess: () => void;
}

const UpdateDescForm = ({ productId, onSuccess }: UpdateDescFormProps) => {
  const editorRef = useRef<RichTextEditorRef>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DescriptionUpdateSchemaType>({
    resolver: zodResolver(descriptionUpdateSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: DescriptionUpdateSchemaType) => {
    try {
      const requestData: UpdateDescriptionRequest = { content: data.content };
      const response = await api.products.updateDescription(
        productId,
        requestData
      );

      if (response.success) {
        toast.success("Đã cập nhật mô tả thành công");
        clearForm();
        onSuccess(); // Notify parent to refresh
      } else {
        toast.error("Không thể cập nhật mô tả");
      }
    } catch (error) {
      toast.error("Có lỗi khi cập nhật mô tả");
      logger.error("Error updating description:", error);
    }
  };

  const clearForm = () => {
    reset();
    editorRef.current?.setContent("");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          control={control}
          name="content"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-lg font-semibold"
              >
                Cập nhật mô tả <span className="text-destructive">*</span>
              </FieldLabel>
              <RichTextEditor
                ref={editorRef}
                content={field.value}
                onChange={field.onChange}
                placeholder="Nhập mô tả bổ sung cho sản phẩm..."
                className="min-h-[200px]"
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={clearForm}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          Xóa
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật mô tả"}
        </Button>
      </div>
    </form>
  );
};

export default UpdateDescForm;
