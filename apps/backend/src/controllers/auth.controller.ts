import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  VerifyResetOtpRequest,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { supabase } from "@/config/supabase";
import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { authService, otpService } from "@/services";
import { NotImplementedError, UnauthorizedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const register = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as RegisterRequest;
    const { email, password, fullName, address } = body;

    const result = await authService.register(
      email,
      password,
      fullName,
      address
    );

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const login = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as LoginRequest;
    const { email, password } = body;

    const result = await authService.login(email, password);

    // Set HttpOnly cookie for refresh token
    const { data: authData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authData?.session?.refresh_token) {
      res.cookie("refreshToken", authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/v1/auth/refresh-token",
      });
    }

    return ResponseHandler.sendSuccess<LoginResponse>(res, result);
  }
);

export const logout = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = req.user!;

    const result = await authService.logout(user.id);

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const refreshToken = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Retrieve refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    const result = await authService.refreshToken(refreshToken);

    // Set new HttpOnly cookie for refresh token
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/v1/auth/refresh-token",
      });
    }

    return ResponseHandler.sendSuccess(res, {
      accessToken: result.accessToken,
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as ForgotPasswordRequest;
    const { email } = body;

    const result = await authService.forgotPassword(email);

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as VerifyEmailRequest;
    const { email, otp } = body;

    const result = await authService.verifyEmail(email, otp);

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const verifyResetOtp = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as VerifyResetOtpRequest;
    const { email, otp } = body;

    const result = await authService.verifyResetOtp(email, otp);

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const resetPassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as ResetPasswordRequest;
    const { resetToken, newPassword } = body;

    const result = await authService.resetPassword(resetToken, newPassword);

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const googleLogin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement Google OAuth login
    throw new NotImplementedError("Google login not implemented yet");
  }
);

export const resendOtp = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as ResendOtpRequest;
    const { email, purpose } = body;

    const result = await otpService.resendOtp(
      email,
      purpose || "EMAIL_VERIFICATION"
    );

    return ResponseHandler.sendSuccess(res, result);
  }
);
