import { supabase } from "@/config/supabase";

import { UnauthorizedError } from "./errors";

/**
 * JWT payload structure from Supabase
 */
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
  iss: string;
}

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token with Supabase Auth
 * Returns user info if valid, throws error if invalid/expired
 */
export async function verifyJwt(token: string) {
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  return data.user;
}

/**
 * Decode JWT payload without verification (for debugging)
 * CAUTION: Does not verify signature, use verifyJwt() for actual validation
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract user claims from verified JWT
 * Should be called after verifyJwt() to ensure token is valid
 */
export function extractUserClaims(token: string) {
  const payload = decodeJwt(token);
  if (!payload) {
    throw new UnauthorizedError("Invalid JWT structure");
  }

  return {
    userId: payload.sub,
    email: payload.email,
    expiresAt: new Date(payload.exp * 1000),
  };
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get OTP expiry time (5 minutes from now)
 */
export function getOtpExpiry(): Date {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}
