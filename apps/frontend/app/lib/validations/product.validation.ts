import { z } from "zod";
import { imageFileSchema, commonValidations } from "./common.validation";

/**
 * Product creation/auction form validation schema
 * @description Validates product auction creation with comprehensive business rules
 */
export const productSchema = z
  .object({
    name: commonValidations
      .requiredString(10, "Tên sản phẩm tối thiểu 10 ký tự")
      .max(100),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),

    // Pricing validation
    startPrice: commonValidations.price(1000, "Giá khởi điểm tối thiểu 1000đ"),
    stepPrice: z.number().int().min(1000, "Bước giá tối thiểu 1000đ"),
    buyNowPrice: z.number().optional().nullable(),

    // Time validation
    startTime: z.date().optional(),
    endTime: z.date({ error: "Vui lòng chọn ngày kết thúc" }),

    // Description validation
    description: commonValidations.requiredString(
      20,
      "Mô tả cần chi tiết hơn (tối thiểu 20 ký tự)"
    ),

    // Image validation
    images: z
      .array(imageFileSchema)
      .min(3, "Vui lòng tải lên tối thiểu 4 ảnh")
      .max(10, "Tối đa 10 ảnh"),

    autoExtend: z.boolean().default(true),
  })
  // Business rule: Buy now price must be higher than start price + step price
  .refine(
    (data) => {
      if (!data.buyNowPrice) return true;
      return data.buyNowPrice >= data.startPrice + data.stepPrice;
    },
    {
      message: "Giá mua ngay phải lớn hơn giá khởi điểm",
      path: ["buyNowPrice"],
    }
  )
  // Business rule: End time must be after start time or current time
  .refine(
    (data) => {
      const start = data.startTime || new Date();
      return data.endTime > start;
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endTime"],
    }
  );

/**
 * Product validation schema type
 */
export type ProductSchemaType = z.infer<typeof productSchema>;
