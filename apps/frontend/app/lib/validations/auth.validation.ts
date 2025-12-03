import { z } from "zod";
import { commonValidations } from "./common.validation";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: commonValidations.email.min(1, "Vui lòng nhập email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

/**
 * OTP (One-Time Password) verification schema
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có đúng 6 ký tự số") // [cite: 665]
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
 * Authentication validation schema types
 */
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type OtpSchemaType = z.infer<typeof otpSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
