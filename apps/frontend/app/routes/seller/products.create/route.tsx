import type { CategoryTree } from "@repo/shared-types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { ActiveSellerRoute } from "@/components/ActiveSellerRoute";
import { CreateProductForm } from "@/components/features/product";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import {
  productSchema,
  type ProductSchemaType,
} from "@/lib/validations/product.validation";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tạo Đấu Giá - Online Auction" },
    {
      name: "description",
      content: "Trang tạo đấu giá cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [selectedImages, setSelectedImages] = useState<
    { file: File; previewUrl: string; id: string }[]
  >([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const defaultValues: ProductSchemaType = {
    name: "",
    categoryId: "",
    startPrice: 0,
    stepPrice: 0,
    buyNowPrice: undefined,
    freeToBid: false,
    endTime: new Date(),
    description: "",
    images: [],
    isAutoExtend: false,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getAll();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        toast.error("Không thể tải danh mục sản phẩm");
        logger.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [selectedImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (selectedImages.length + files.length > 10) {
      toast.error("Tối đa 10 ảnh được phép tải lên");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    toast.success(`Đã chọn ${files.length} ảnh`);
  };

  const removeImage = (id: string) => {
    const imageIndex = selectedImages.findIndex((img) => img.id === id);
    if (imageIndex === -1) return;

    const imageToRemove = selectedImages[imageIndex];
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleCancel = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    // Reset form and navigate back or reset state
    window.history.back();
  };

  const handleSubmit = async (data: ProductSchemaType) => {
    if (selectedImages.length < 4) {
      toast.error("Vui lòng chọn tối thiểu 4 ảnh");
      throw new Error("Minimum 4 images required");
    }

    setUploadingImages(true);

    try {
      const formData = new FormData();
      selectedImages.forEach((image) => {
        formData.append("images", image.file);
      });

      const uploadResponse = await api.products.uploadImages(formData);
      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error("Image upload failed");
      }

      const createProductData = {
        ...data,
        buyNowPrice: data.buyNowPrice,
        startTime: new Date().toISOString(),
        endTime: data.endTime.toISOString(),
        images: uploadResponse.data.urls,
      };

      const response = await api.products.create(createProductData);
      return response;
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <ActiveSellerRoute>
      <CreateProductForm
        schema={productSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        categories={categories}
        selectedImages={selectedImages}
        onImageUpload={handleImageUpload}
        onImageRemove={removeImage}
        uploadingImages={uploadingImages}
        onCancel={handleCancel}
      />
    </ActiveSellerRoute>
  );
}
