import { Request } from "express";
import { rateLimit } from "express-rate-limit";

/**
 * Rate limiting configurations for different endpoints
 * Prevents brute force attacks and abuse
 */

// Authentication rate limiter - strict limits for login
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    req.ip || req.socket.remoteAddress || "unknown",
});

// Password reset rate limiter - moderate limits
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per window
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    req.ip || req.socket.remoteAddress || "unknown",
});

// General API rate limiter - loose limits for other endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    req.ip || req.socket.remoteAddress || "unknown",
});
