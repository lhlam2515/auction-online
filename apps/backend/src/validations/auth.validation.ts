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

export const verifyOtpSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  otp: z.string().length(6, { error: "OTP must be 6 digits" }),
});

export const resetPasswordSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  otp: z.string().length(6, { error: "OTP must be 6 digits" }),
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { error: "Token is required" }),
});

export const resendVerificationSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
});
