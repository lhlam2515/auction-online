import {
  Clock,
  DollarSign,
  Image as ImageIcon,
  Package,
  Send,
} from "lucide-react";
import type { FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import BasicInfoFields from "./BasicInfoFields";
import ImageUploadFields from "./ImageUploadFields";
import PricingFields from "./PricingFields";
import TimeSettingsFields from "./TimeSettingsFields";

interface ProductFormFieldsProps<T extends FieldValues> {
  defaultValues: T;
  categories: Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;
  selectedImages: Array<{ file: File; previewUrl: string; id: string }>;
  onImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (files: File[]) => void
  ) => void;
  onImageRemove: (id: string, onChange: (files: File[]) => void) => void;
  uploadingImages: boolean;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProductFormFields = <T extends FieldValues>({
  categories,
  selectedImages,
  onImageUpload,
  onImageRemove,
  uploadingImages,
  onCancel,
  isSubmitting,
}: ProductFormFieldsProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <>
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Package className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Thông tin cơ bản</CardTitle>
              <CardDescription className="text-lg">
                Nhập thông tin cơ bản về sản phẩm đấu giá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BasicInfoFields control={control} categories={categories} />
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <DollarSign className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Thông tin giá</CardTitle>
              <CardDescription className="text-lg">
                Thiết lập giá khởi điểm và các thông tin liên quan đến giá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PricingFields control={control} />
        </CardContent>
      </Card>

      {/* Time Settings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Clock className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Thời gian đấu giá</CardTitle>
              <CardDescription className="text-lg">
                Thiết lập thời gian bắt đầu và kết thúc đấu giá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TimeSettingsFields control={control} />
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ImageIcon className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Hình ảnh sản phẩm</CardTitle>
              <CardDescription className="text-lg">
                Tải lên hình ảnh chất lượng cao của sản phẩm (tối thiểu 4 ảnh)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ImageUploadFields
            control={control}
            selectedImages={selectedImages}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
            uploadingImages={uploadingImages}
          />
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Send className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Hoàn thành</CardTitle>
              <CardDescription className="text-lg">
                Kiểm tra lại thông tin và tạo sản phẩm đấu giá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-end gap-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || uploadingImages}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || uploadingImages}>
              {isSubmitting && <Spinner className="mr-1 h-4 w-4" />}
              {isSubmitting ? "Đang tạo..." : "Tạo sản phẩm"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductFormFields;
