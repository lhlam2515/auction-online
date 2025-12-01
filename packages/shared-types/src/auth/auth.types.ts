import type { User } from "../user";

/**
 * User registration request
 * Backend validation: auth.validation.ts → registerSchema
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  address?: string;
}

/**
 * User login request
 * Backend validation: auth.validation.ts → loginSchema
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response with user data and access token
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
}

/**
 * Forgot password request
 * Backend validation: auth.validation.ts → forgotPasswordSchema
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * OTP verification request
 * Backend validation: auth.validation.ts → verifyOtpSchema
 */
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

/**
 * Password reset request
 * Backend validation: auth.validation.ts → resetPasswordSchema
 */
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * Email verification request
 * Backend validation: auth.validation.ts → verifyEmailSchema
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Resend verification email request
 * Backend validation: auth.validation.ts → resendVerificationSchema
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Google login response
 */
export interface GoogleLoginResponse {
  user: User;
  accessToken: string;
}
