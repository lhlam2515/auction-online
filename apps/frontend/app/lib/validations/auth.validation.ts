import { z } from "zod";

import { commonValidations } from "./common.validation";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: commonValidations.email.min(1, "Vui lòng nhập email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  recaptchaToken: z.string().min(1, "Vui lòng xác thực reCAPTCHA"),
});

/**
 * User registration form validation schema
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(50, "Họ tên quá dài"),
    email: commonValidations.email.min(1, "Vui lòng nhập email"),
    address: z.string().min(5, "Địa chỉ quá ngắn").max(100, "Địa chỉ quá dài"),
    password: z.string().min(8, "Mật khẩu phải có tối thiểu 8 ký tự"), //
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    recaptchaToken: z.string().min(1, "Vui lòng xác thực reCAPTCHA"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

/**
 * OTP verification with email schema
 */
export const verifyOtpSchema = z.object({
  email: commonValidations.email.min(1, "Vui lòng nhập email"),
  otp: z
    .string()
    .length(6, "Mã OTP phải có đúng 6 ký tự số")
    .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Nhập mật khẩu cũ"),
    newPassword: z.string().min(8, "Mật khẩu mới phải tối thiểu 8 ký tự"),
    confirmNewPassword: z.string().min(1, "Xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "Mật khẩu mới không được trùng mật khẩu cũ", // [cite: 648]
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: commonValidations.email.min(1, "Vui lòng nhập email"),
  recaptchaToken: z.string().min(1, "Vui lòng xác thực reCAPTCHA"),
});

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải tối thiểu 8 ký tự")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số",
      })
      .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      }),
    confirmNewPassword: z.string().min(1, "Xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

/**
 * Authentication validation schema types
 */
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type VerifyOtpSchemaType = z.infer<typeof verifyOtpSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
