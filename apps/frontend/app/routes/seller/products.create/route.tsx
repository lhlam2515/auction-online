import { zodResolver } from "@hookform/resolvers/zod";
import type { CategoryTree } from "@repo/shared-types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { APP_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";
import {
  productSchema,
  type ProductSchemaType,
} from "@/lib/validations/product.validation";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Auction - Online Auction" },
    {
      name: "description",
      content: "Create Auction page for Online Auction App",
    },
  ];
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [selectedImages, setSelectedImages] = useState<
    { file: File; previewUrl: string; id: string }[]
  >([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
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
    },
  });

  // Fetch categories on component mount
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

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [selectedImages]);

  // Handle image selection (preview only)
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (selectedImages.length + files.length > 10) {
      toast.error("Tối đa 10 ảnh được phép tải lên");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: Date.now() + Math.random().toString(36), // Generate unique ID
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);

    // Update form data
    const currentImages = form.getValues("images");
    form.setValue("images", [...currentImages, ...files]);

    toast.success(`Đã chọn ${files.length} ảnh`);
  };

  // Remove selected image
  const removeImage = (id: string) => {
    const imageIndex = selectedImages.findIndex((img) => img.id === id);
    if (imageIndex === -1) return;

    const imageToRemove = selectedImages[imageIndex];
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const newSelectedImages = selectedImages.filter((img) => img.id !== id);
    setSelectedImages(newSelectedImages);

    const currentImages = form.getValues("images");
    const newImages = currentImages.filter((_, i) => i !== imageIndex);
    form.setValue("images", newImages);
  };

  // Render category options with grouping
  const renderCategoryOptions = () => {
    return categories.map((parentCategory) => (
      <SelectGroup key={parentCategory.id}>
        <SelectLabel>{parentCategory.name}</SelectLabel>
        {parentCategory.children?.map((childCategory) => (
          <SelectItem key={childCategory.id} value={childCategory.id}>
            {childCategory.name}
          </SelectItem>
        ))}
      </SelectGroup>
    ));
  };

  // Handle form submission
  const onSubmit = async (data: ProductSchemaType) => {
    if (selectedImages.length < 4) {
      toast.error("Vui lòng chọn tối thiểu 4 ảnh");
      return;
    }

    setIsSubmitting(true);
    setUploadingImages(true);

    try {
      // Upload images first
      const formData = new FormData();
      selectedImages.forEach((image) => {
        formData.append("images", image.file);
      });

      const uploadResponse = await api.products.uploadImages(formData);
      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error("Image upload failed");
      }

      // Create product with uploaded image URLs
      const createProductData = {
        ...data,
        buyNowPrice: data.buyNowPrice,
        endTime: data.endTime.toISOString(),
        images: uploadResponse.data.urls,
      };

      const response = await api.products.create(createProductData);
      if (response.success && response.data) {
        toast.success("Tạo sản phẩm thành công!");

        // Cleanup preview URLs
        selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));

        setTimeout(() => {
          navigate(APP_ROUTES.PRODUCT(response.data.id));
        }, 2000);
      } else {
        throw new Error("Product creation failed");
      }

      // Reset form
      form.reset();
      setSelectedImages([]);
    } catch (error) {
      toast.error("Lỗi khi tạo sản phẩm");
      logger.error("Product creation failed:", error);
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tạo sản phẩm đấu giá mới
          </h1>
          <p className="mt-2 text-gray-600">
            Điền đầy đủ thông tin để tạo sản phẩm đấu giá mới
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-800">
                Thông tin cơ bản
              </h2>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Danh mục <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>{renderCategoryOptions()}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>
                      Mô tả sản phẩm <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Mô tả chi tiết về sản phẩm: tình trạng, xuất xứ, đặc điểm nổi bật..."
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả chi tiết giúp người mua hiểu rõ hơn về sản phẩm. Mô
                      tả có thể bổ sung thêm sau khi tạo sản phẩm.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-800">
                Thông tin giá
              </h2>

              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                {/* Start Price */}
                <FormField
                  control={form.control}
                  name="startPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá khởi điểm (VND){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="1.000"
                          value={
                            field.value
                              ? field.value.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, "");
                            if (numbers) {
                              field.onChange(Number.parseInt(numbers));
                            } else {
                              field.onChange(0);
                            }
                          }}
                          className="text-lg font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Step Price */}
                <FormField
                  control={form.control}
                  name="stepPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bước giá (VND) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="1.000"
                          value={
                            field.value
                              ? field.value.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, "");
                            if (numbers) {
                              field.onChange(Number.parseInt(numbers));
                            } else {
                              field.onChange(0);
                            }
                          }}
                          className="text-lg font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buy Now Price */}
                <FormField
                  control={form.control}
                  name="buyNowPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá mua ngay (VND)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Không bắt buộc"
                          value={
                            field.value
                              ? field.value.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, "");
                            if (numbers) {
                              field.onChange(Number.parseInt(numbers));
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                          className="text-lg font-semibold"
                        />
                      </FormControl>
                      <FormDescription>
                        Người mua có thể mua ngay với giá này
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Free to Bid */}
              <FormField
                control={form.control}
                name="freeToBid"
                render={({ field }) => (
                  <FormItem className="mt-6 flex flex-row items-start space-y-0 space-x-3 rounded-lg bg-blue-50 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Đấu giá tự do</FormLabel>
                      <FormDescription>
                        Cho phép người dùng có điểm đánh giá dưới 80% vẫn có thể
                        tham gia đấu giá
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Time Settings */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-800">
                Thời gian đấu giá
              </h2>

              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                {/* End Time */}
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Thời gian kết thúc{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy HH:mm", {
                                  locale: vi,
                                })
                              ) : (
                                <span>Chọn ngày và giờ</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const todayAtMidnight = new Date();
                              todayAtMidnight.setHours(0, 0, 0, 0);
                              return date < todayAtMidnight;
                            }}
                            autoFocus
                          />
                          <div className="border-border border-t p-3">
                            <Label>Thời gian</Label>
                            <Input
                              type="time"
                              className="mt-1"
                              step="60"
                              pattern="[0-9]{2}:[0-9]{2}"
                              placeholder="HH:MM"
                              defaultValue={
                                field.value
                                  ? field.value.toTimeString().slice(0, 5)
                                  : ""
                              }
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  const newDate = new Date(field.value);
                                  newDate.setHours(
                                    parseInt(hours),
                                    parseInt(minutes)
                                  );
                                  field.onChange(newDate);
                                }
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Thời gian đấu giá sẽ kết thúc
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Auto Extend */}
                <FormField
                  control={form.control}
                  name="isAutoExtend"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-lg bg-green-50 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Tự động gia hạn</FormLabel>
                        <FormDescription>
                          Tự động gia hạn thời gian nếu có người đặt giá trong
                          những phút cuối
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Images */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-800">
                Hình ảnh sản phẩm
              </h2>

              {/* Upload Area */}
              <div className="mb-6">
                <Label htmlFor="image-upload" className="mb-2 block">
                  Chọn ảnh (tối thiểu 4 ảnh, tối đa 10 ảnh){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <p className="my-2 flex items-center text-sm text-blue-600">
                  Chọn ảnh đại diện trước, rồi chọn các ảnh còn lại sau. Ảnh sẽ
                  được tải lên khi tạo sản phẩm.
                </p>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
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

              {/* Selected Images Preview */}
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

                        {/* Main image indicator */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs text-white shadow-lg">
                            Ảnh chính
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormMessage className="mt-2">
                {form.formState.errors.images?.message}
              </FormMessage>
            </div>

            {/* Submit Button */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-end gap-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    selectedImages.forEach((img) =>
                      URL.revokeObjectURL(img.previewUrl)
                    );
                    form.reset();
                    setSelectedImages([]);
                  }}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || uploadingImages}
                  className="w-full min-w-[120px] bg-blue-600 hover:bg-blue-700 sm:w-auto"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Đang tạo...
                    </div>
                  ) : (
                    "Tạo sản phẩm"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
