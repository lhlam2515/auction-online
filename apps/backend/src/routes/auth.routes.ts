import { Router } from "express";

import * as authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth";
import {
  authRateLimit,
  passwordResetRateLimit,
} from "@/middlewares/rate-limiter";
import { validate } from "@/middlewares/validate";
import * as authValidation from "@/validations/auth.validation";

const router = Router();

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user account
 * @access  Public
 */
router.post(
  "/register",
  validate({ body: authValidation.registerSchema }),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post(
  "/login",
  authRateLimit, // SECURITY: Rate limiting to prevent brute force attacks
  validate({ body: authValidation.loginSchema }),
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (uses HttpOnly cookie)
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post(
  "/forgot-password",
  passwordResetRateLimit, // SECURITY: Rate limiting to prevent abuse
  validate({ body: authValidation.forgotPasswordSchema }),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP code (for registration)
 * @access  Public
 */
router.post(
  "/verify-email",
  validate({ body: authValidation.verifyEmailSchema }),
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify reset OTP and get reset token
 * @access  Public
 */
router.post(
  "/verify-reset-otp",
  validate({ body: authValidation.verifyResetOtpSchema }),
  authController.verifyResetOtp
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with reset token (from verify-reset-otp)
 * @access  Public
 */
router.post(
  "/reset-password",
  passwordResetRateLimit, // SECURITY: Rate limiting to prevent abuse
  validate({ body: authValidation.resetPasswordSchema }),
  authController.resetPassword
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend email verification OTP
 * @access  Public
 */
router.post(
  "/resend-otp",
  authRateLimit, // SECURITY: Rate limiting to prevent abuse
  validate({ body: authValidation.resendOtpSchema }),
  authController.resendOtp
);

/**
 * @route   POST /api/auth/signin-with-oauth
 * @desc    Sign in or register user using third-party OAuth provider
 * @access  Public
 */
router.post(
  "/signin-with-oauth",
  validate({ body: authValidation.signInWithOAuthSchema }),
  authController.signInWithOAuth
);

/**
 * @route   GET /api/auth/oauth/callback
 * @desc    OAuth callback endpoint for third-party providers
 * @access  Public
 */
router.get(
  "/oauth/callback",
  validate({
    query: authValidation.handleOAuthCallbackSchema,
  }),
  authController.handleOAuthCallback
);

export default router;
