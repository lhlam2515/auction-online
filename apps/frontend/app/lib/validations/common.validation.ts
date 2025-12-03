import { z } from "zod";
import { UPLOAD_LIMITS } from "@/constants/api";

/**
 * Image file validation schema
 * @description Validates uploaded image files for size and type constraints
 */
export const imageFileSchema = z
  .any()
  .refine(
    (file) => file?.size <= UPLOAD_LIMITS.MAX_FILE_SIZE,
    `Kích thước ảnh tối đa là 5MB`
  )
  .refine(
    (file) => UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file?.type),
    "Chỉ chấp nhận định dạng .jpg, .jpeg, .png"
  );

/**
 * Common validation utilities and reusable schemas
 */
export const commonValidations = {
  /** Email validation with Vietnamese error message */
  email: z.email("Email không đúng định dạng"),

  /** Required string with minimum length */
  requiredString: (min: number, message?: string) =>
    z.string().min(min, message || `Tối thiểu ${min} ký tự`),

  /** Optional string with maximum length */
  optionalString: (max: number, message?: string) =>
    z
      .string()
      .max(max, message || `Tối đa ${max} ký tự`)
      .optional(),

  /** Price validation for Vietnamese currency */
  price: (min: number = 1000, message?: string) =>
    z
      .number({ error: "Vui lòng nhập số" })
      .min(min, message || `Giá tối thiểu ${min.toLocaleString()}đ`),

  /** Date validation */
  futureDate: z
    .date()
    .refine((date) => date > new Date(), "Ngày phải sau thời điểm hiện tại"),
};
