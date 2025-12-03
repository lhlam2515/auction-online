import { z } from "zod";
import { commonValidations } from "./common.validation";

/**
 * User profile update validation schema
 * @description Validates user profile information updates
 */
export const updateProfileSchema = z.object({
  fullName: commonValidations.requiredString(2, "Họ tên quá ngắn"),
  email: commonValidations.email,
  birthDate: z.coerce.date().max(new Date(), "Ngày sinh không hợp lệ"),
});

/**
 * User rating validation schema
 * @description Validates user feedback ratings (like/dislike system)
 */
export const ratingSchema = z.object({
  score: z.union([z.literal(1), z.literal(-1)], {
    error: "Vui lòng chọn Like (+1) hoặc Dislike (-1)",
  }),
  comment: commonValidations.optionalString(200, "Đánh giá tối đa 200 ký tự"),
});

/**
 * Account upgrade request validation schema
 * @description Validates seller account upgrade requests with reason and terms agreement
 * @remarks Requires explicit agreement to terms (must be true)
 */
export const upgradeRequestSchema = z.object({
  reason: z
    .string()
    .min(20, "Vui lòng nhập lý do cụ thể hơn (tối thiểu 20 ký tự)")
    .max(500, "Lý do tối đa 500 ký tự"),
  agreedToTerms: z.literal(true, {
    error: "Bạn phải đồng ý với cam kết",
  }),
});

/**
 * User validation schema types
 */
export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
export type RatingSchemaType = z.infer<typeof ratingSchema>;
export type UpgradeRequestSchemaType = z.infer<typeof upgradeRequestSchema>;
