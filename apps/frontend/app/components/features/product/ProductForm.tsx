import type { ApiResponse } from "@repo/shared-types";
import { FormProvider, type FieldValues } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { APP_ROUTES } from "@/constants/routes";
import { useProductForm } from "@/hooks/useProductForm";
import logger from "@/lib/logger";

import ProductFormFields from "./ProductFormFields";

interface ProductFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ApiResponse>;
  categories: Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;
  selectedImages: Array<{ file: File; previewUrl: string; id: string }>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (id: string) => void;
  uploadingImages: boolean;
  onCancel: () => void;
}

const ProductForm = <T extends FieldValues>(props: ProductFormProps<T>) => {
  const {
    defaultValues,
    categories,
    selectedImages,
    onImageUpload,
    onImageRemove,
    uploadingImages,
    onCancel,
  } = props;
  const navigate = useNavigate();

  const { form, handleSubmit, isSubmitting, errors } = useProductForm({
    ...props,
    onSuccess: (data: T, result: ApiResponse, message: string) => {
      toast.success(message);

      if (
        result.success &&
        result.data &&
        typeof result.data === "object" &&
        "id" in result.data
      ) {
        // Cleanup preview URLs
        selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));

        setTimeout(() => {
          navigate(APP_ROUTES.PRODUCT((result.data as { id: string }).id));
        }, 2000);
      }
    },
    onError: (_data: T, error: unknown, errorMessage: string) => {
      logger.error("Product creation failed:", error);
      toast.error(errorMessage);
    },
  });

  return (
    <FormProvider {...form}>
      <form
        id="product-form"
        // @ts-expect-error - Generic type constraint between form and handler
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        noValidate
      >
        {errors.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{errors.root.message}</p>
          </div>
        )}

        <ProductFormFields
          defaultValues={defaultValues}
          categories={categories}
          selectedImages={selectedImages}
          onImageUpload={onImageUpload}
          onImageRemove={onImageRemove}
          uploadingImages={uploadingImages}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
};

export default ProductForm;
