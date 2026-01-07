import { z } from "zod";

/**
 * Admin - Update user info validation schema
 * @description Validates admin updating user basic information
 */
export const updateUserInfoSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  address: z.string().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Ngày sinh phải có định dạng YYYY-MM-DD",
    })
    .optional(),
});

/**
 * Admin - Update account status validation schema
 * @description Validates admin updating user account status
 */
export const updateAccountStatusSchema = z.object({
  accountStatus: z.enum(["PENDING_VERIFICATION", "ACTIVE", "BANNED"], {
    error: "Vui lòng chọn trạng thái tài khoản",
  }),
});

/**
 * Admin - Update user role validation schema
 * @description Validates admin updating user role
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(["BIDDER", "SELLER", "ADMIN"], {
    error: "Vui lòng chọn vai trò hợp lệ",
  }),
});

/**
 * Admin - Reset user password validation schema
 * @description Validates admin resetting user password
 */
export const resetUserPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[a-z]/, {
        message: "Mật khẩu phải chứa ít nhất một chữ thường",
      })
      .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất một chữ hoa" })
      .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một chữ số" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      }),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận lại mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

/**
 * Admin - Ban user validation schema
 * @description Validates admin banning/unbanning user
 */
export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z.string().min(10, "Lý do phải có ít nhất 10 ký tự"),
  duration: z.number().min(0, "Thời gian ban không hợp lệ").optional(),
});

/**
 * Admin - Create user validation schema
 * @description Validates admin creating new user
 */
export const createUserSchema = z.object({
  email: z.email("Email không hợp lệ"),
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(30, "Username không được vượt quá 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username chỉ chứa chữ cái, số và dấu gạch dưới",
    }),
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  role: z.enum(["BIDDER", "SELLER", "ADMIN"]),
  address: z.string().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Birth date must be in YYYY-MM-DD format",
    })
    .optional(),
});

/**
 * Admin - Update auction settings validation schema
 * @description Validates admin updating auction settings
 */
export const updateAuctionSettingsSchema = z.object({
  extendThresholdMinutes: z
    .number()
    .int()
    .min(1, { message: "Ngưỡng gia hạn phải từ 1 phút trở lên" })
    .max(30, { message: "Ngưỡng gia hạn không được vượt quá 30 phút" }),
  extendDurationMinutes: z
    .number()
    .int()
    .min(1, { message: "Thời gian gia hạn phải từ 1 phút trở lên" })
    .max(60, { message: "Thời gian gia hạn không được vượt quá 60 phút" }),
});

// Export form data types
export type UpdateUserInfoFormData = z.infer<typeof updateUserInfoSchema>;
export type UpdateAccountStatusFormData = z.infer<
  typeof updateAccountStatusSchema
>;
export type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;
export type ResetUserPasswordFormData = z.infer<typeof resetUserPasswordSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateAuctionSettingsFormData = z.infer<
  typeof updateAuctionSettingsSchema
>;
