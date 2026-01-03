import { z } from "zod";

/**
 * Admin - Update user info validation schema
 * @description Validates admin updating user basic information
 */
export const updateUserInfoSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  address: z.string().optional(),
  birthDate: z.string().optional(),
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
  reason: z.string().min(10, "Lý do phải có ít nhất 10 ký tự").optional(),
  duration: z.number().min(0, "Thời gian ban không hợp lệ").optional(),
});
