import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  VerifyOtpResponse,
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
import { UnauthorizedError } from "@/utils/errors";
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

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const login = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as LoginRequest;
    const { email, password } = body;

    const result = await authService.login(email, password);

    // Get refresh and access tokens from Supabase
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
        path: "/api/v1/auth",
      });
    }

    // SECURITY: Store accessToken in httpOnly cookie
    // This prevents XSS attacks from stealing the token via localStorage
    if (authData?.session?.access_token) {
      res.cookie("accessToken", authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/api/v1",
      });
    }

    return ResponseHandler.sendSuccess<LoginResponse>(res, result);
  }
);

export const logout = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = req.user!;

    const result = await authService.logout(user.id);

    res.clearCookie("accessToken", { path: "/api/v1" });
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
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

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/v1/auth",
      });
    }

    if (result.accessToken) {
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/api/v1",
      });
    }

    // Return empty response - token is in the cookie
    return ResponseHandler.sendNoContent(res);
  }
);

export const forgotPassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as ForgotPasswordRequest;
    const { email } = body;

    const result = await authService.forgotPassword(email);

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as VerifyEmailRequest;
    const { email, otp } = body;

    const result = await authService.verifyEmail(email, otp);

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const verifyResetOtp = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as VerifyResetOtpRequest;
    const { email, otp } = body;

    const result = await authService.verifyResetOtp(email, otp);

    return ResponseHandler.sendSuccess<VerifyOtpResponse>(res, result);
  }
);

export const resetPassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as ResetPasswordRequest;
    const { resetToken, newPassword } = body;

    const result = await authService.resetPassword(resetToken, newPassword);

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const resendOtp = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as ResendOtpRequest;
    const { email, purpose } = body;

    const result = await otpService.resendOtp(email, purpose);

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);
