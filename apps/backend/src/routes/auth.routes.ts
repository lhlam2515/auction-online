import { Router } from "express";
import * as authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as authValidation from "@/validations/auth.validation";

const router = Router();

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
 * @access  Private
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post(
  "/forgot-password",
  validate({ body: authValidation.forgotPasswordSchema }),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post(
  "/verify-otp",
  validate({ body: authValidation.verifyOtpSchema }),
  authController.verifyOtp
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post(
  "/reset-password",
  validate({ body: authValidation.resetPasswordSchema }),
  authController.resetPassword
);

/**
 * @route   POST /api/auth/google
 * @desc    Login with Google OAuth
 * @access  Public
 */
router.post("/google", authController.googleLogin);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  "/verify-email",
  validate({ body: authValidation.verifyEmailSchema }),
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  "/resend-verification",
  validate({ body: authValidation.resendVerificationSchema }),
  authController.resendVerification
);

export default router;
