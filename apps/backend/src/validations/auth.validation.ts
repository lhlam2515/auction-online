import { z } from "zod";

export const registerSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  fullName: z
    .string()
    .min(2, { error: "Full name must be at least 2 characters" }),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  password: z.string().min(1, { error: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
});

export const verifyEmailSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  otp: z.string().length(6, { error: "OTP must be 6 digits" }),
});

export const verifyResetOtpSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  otp: z.string().length(6, { error: "OTP must be 6 digits" }),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, { error: "Reset token is required" }),
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

export const resendOtpSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  purpose: z
    .enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"], {
      error: "Purpose must be either EMAIL_VERIFICATION or PASSWORD_RESET",
    })
    .optional()
    .default("EMAIL_VERIFICATION"),
});
