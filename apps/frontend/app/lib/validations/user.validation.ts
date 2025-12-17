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

export const changePassword = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z
      .string()
      .min(8, { message: "Mật khẩu mới phải có ít nhất 8 ký tự" })
      .regex(/[a-z]/, {
        message: "Mật khẩu mới phải chứa ít nhất một chữ thường",
      })
      .regex(/[A-Z]/, { message: "Mật khẩu mới phải chứa ít nhất một chữ hoa" })
      .regex(/[0-9]/, { message: "Mật khẩu mới phải chứa ít nhất một chữ số" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Mật khẩu mới phải chứa ít nhất một ký tự đặc biệt",
      }),

    confirmPassword: z.string().min(1, "Vui lòng xác nhận lại mật khẩu"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới không được trùng mật khẩu cũ", // [cite: 648]
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
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
