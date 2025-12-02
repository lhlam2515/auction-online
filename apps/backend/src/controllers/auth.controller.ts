import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "@repo/shared-types";

export const register = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as RegisterRequest;
    // TODO: Implement user registration logic
    throw new NotImplementedError("Register not implemented yet");
  }
);

export const login = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as LoginRequest;
    // TODO: Implement login logic
    // ResponseHandler.sendSuccess<LoginResponse>(res, { user, accessToken });
    throw new NotImplementedError("Login not implemented yet");
  }
);

export const logout = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement logout logic
    ResponseHandler.sendSuccess(res, { message: "Logged out successfully" });
  }
);

export const refreshToken = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement refresh token logic
    throw new NotImplementedError("Refresh token not implemented yet");
  }
);

export const forgotPassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ForgotPasswordRequest;
    // TODO: Implement forgot password logic
    throw new NotImplementedError("Forgot password not implemented yet");
  }
);

export const verifyOtp = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as VerifyOtpRequest;
    // TODO: Implement OTP verification logic
    throw new NotImplementedError("Verify OTP not implemented yet");
  }
);

export const resetPassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ResetPasswordRequest;
    // TODO: Implement reset password logic
    throw new NotImplementedError("Reset password not implemented yet");
  }
);

export const googleLogin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement Google OAuth login
    throw new NotImplementedError("Google login not implemented yet");
  }
);

export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as VerifyEmailRequest;
    // TODO: Implement email verification
    throw new NotImplementedError("Verify email not implemented yet");
  }
);

export const resendVerification = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ResendVerificationRequest;
    // TODO: Implement resend verification email
    throw new NotImplementedError("Resend verification not implemented yet");
  }
);
