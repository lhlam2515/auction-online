/**
 * User registration request
 * Backend validation: auth.validation.ts → registerSchema
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  address: string;
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
 * Forgot password request
 * Backend validation: auth.validation.ts → forgotPasswordSchema
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Email verification request
 * Backend validation: auth.validation.ts → verifyEmailSchema
 */
export interface VerifyEmailRequest {
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
 * Resend OTP request
 * Backend validation: auth.validation.ts → resendOtpSchema
 */
export interface ResendOtpRequest {
  email: string;
}

/**
 * Google login request
 * Backend validation: auth.validation.ts → googleLoginSchema
 */
export interface GoogleLoginRequest {
  token: string;
}
