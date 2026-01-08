import type {
  RegisterRequest,
  LoginRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  VerifyResetOtpRequest,
  UserAuthData,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { authService, otpService } from "@/services";
import { setAuthCookies } from "@/utils/cookies";
import { UnauthorizedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;

    const user = await authService.getAuthData(userId);

    return ResponseHandler.sendSuccess<{ user: UserAuthData }>(res, { user });
  }
);

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

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password
    );

    // SECURITY: Store ONLY refreshToken in httpOnly cookie
    // accessToken will be sent in response body for client-side memory storage
    setAuthCookies(res, undefined, refreshToken);

    return ResponseHandler.sendSuccess<{
      user: UserAuthData;
      accessToken: string;
    }>(res, { user, accessToken });
  }
);

export const logout = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Get accessToken from Authorization header instead of cookies
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // Nếu có access token, gọi Supabase admin.signOut để vô hiệu hóa token
    if (accessToken) {
      const result = await authService.logout(accessToken);

      res.clearCookie("refreshToken", { path: "/api/v1/auth" });

      return ResponseHandler.sendSuccess(res, null, 200, result.message);
    }

    // Nếu không có token, vẫn clear cookies (client-side logout)
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });

    return ResponseHandler.sendSuccess(res, null, 200, "Đăng xuất thành công.");
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

    // SECURITY: Store ONLY refreshToken in httpOnly cookie
    setAuthCookies(res, undefined, result.refreshToken);

    // Return accessToken in response body for client-side memory storage
    return ResponseHandler.sendSuccess<{ accessToken: string }>(res, {
      accessToken: result.accessToken,
    });
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

export const signInWithOAuth = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { provider, redirectTo } = req.body;

    const result = await authService.signInWithOAuth(provider, redirectTo);

    return ResponseHandler.sendSuccess<{ redirectUrl: string }>(res, result);
  }
);

export const handleOAuthCallback = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { code } = res.locals.query;

    const { accessToken, refreshToken } =
      await authService.handleOAuthCallback(code);

    // SECURITY: Store ONLY refreshToken in httpOnly cookie
    setAuthCookies(res, undefined, refreshToken);

    // Redirect with accessToken as query parameter for frontend to capture
    // Frontend will store it in memory and then clean the URL
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
  }
);
