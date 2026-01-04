import { Trash2, Upload, X } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface ImageUploadFieldsProps<T extends FieldValues> {
  control: Control<T>;
  selectedImages: Array<{ file: File; previewUrl: string; id: string }>;
  onImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (files: File[]) => void
  ) => void;
  onImageRemove: (id: string, onChange: (files: File[]) => void) => void;
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
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className="flex flex-col gap-4"
        >
          <div>
            <FieldLabel
              htmlFor={field.name}
              className="mb-2 block text-base font-semibold"
            >
              Chọn ảnh (tối thiểu 4 ảnh, tối đa 10 ảnh){" "}
              <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
              Chọn ảnh đại diện trước, rồi chọn các ảnh còn lại sau. Ảnh sẽ được
              tải lên khi tạo sản phẩm.
            </FieldDescription>

            {selectedImages.length < 10 && (
              <div className="border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 mt-4 rounded-lg border-2 border-dashed text-center transition-colors">
                <Input
                  id={field.name}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, field.onChange)}
                  className="hidden"
                  disabled={uploadingImages}
                />
                <Label
                  htmlFor={field.name}
                  className="flex cursor-pointer flex-col items-center p-8"
                >
                  {uploadingImages ? (
                    <div className="flex flex-col items-center">
                      <Spinner className="mb-4 h-12 w-12" />
                      <span className="text-foreground mb-2 text-lg font-medium">
                        Đang tải lên...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-muted-foreground mb-4 h-12 w-12" />
                      <span className="text-foreground mb-2 text-lg font-medium">
                        Chọn ảnh để tải lên
                      </span>
                      <span className="text-muted-foreground text-sm">
                        JPG, PNG, WEBP tối đa 5MB mỗi ảnh
                      </span>
                    </>
                  )}
                </Label>
              </div>
            )}
          </div>

          {selectedImages.length > 0 && (
            <div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {selectedImages.map((image, index) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                      <img
                        src={image.previewUrl}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {index === 0 && (
                      <Badge className="absolute top-2 left-2">Ảnh chính</Badge>
                    )}

                    <Button
                      variant="destructive"
                      onClick={() => onImageRemove(image.id, field.onChange)}
                      className="absolute top-2 right-2 cursor-pointer rounded-full opacity-0 transition-all duration-200 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
