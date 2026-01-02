import { Upload, X } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";

interface ImageUploadFieldsProps<T extends FieldValues> {
  control: Control<T>;
  selectedImages: Array<{ file: File; previewUrl: string; id: string }>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (id: string) => void;
  uploadingImages: boolean;
}

const ImageUploadFields = <T extends FieldValues>({
  control,
  selectedImages,
  onImageUpload,
  onImageRemove,
  uploadingImages,
}: ImageUploadFieldsProps<T>) => {
  return (
    <Controller
      control={control}
      name={"images" as Path<T>}
      render={({ fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className="flex flex-col gap-4"
        >
          <div>
            <FieldLabel
              htmlFor="image-upload"
              className="mb-2 block text-base font-semibold"
            >
              Chọn ảnh (tối thiểu 4 ảnh, tối đa 10 ảnh){" "}
              <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
              Chọn ảnh đại diện trước, rồi chọn các ảnh còn lại sau. Ảnh sẽ được
              tải lên khi tạo sản phẩm.
            </FieldDescription>
            <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
                disabled={uploadingImages || selectedImages.length >= 10}
              />
              <Label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                {uploadingImages ? (
                  <div className="flex flex-col items-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="mb-2 text-lg font-medium text-gray-700">
                      Đang tải lên...
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-gray-400" />
                    <span className="mb-2 text-lg font-medium text-gray-700">
                      Chọn ảnh để tải lên
                    </span>
                    <span className="text-sm text-gray-500">
                      JPG, PNG, WEBP tối đa 5MB mỗi ảnh
                    </span>
                  </>
                )}
              </Label>
            </div>
          </div>

          {selectedImages.length > 0 && (
            <div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {selectedImages.map((image, index) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                      <img
                        src={image.previewUrl}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {index === 0 && (
                      <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs text-white shadow-lg">
                        Ảnh chính
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onImageRemove(image.id)}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default ImageUploadFields;
