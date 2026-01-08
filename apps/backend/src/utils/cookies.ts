import { Response } from "express";

const ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_EXPIRY = 14 * 24 * 60 * 60 * 1000; // 14 days

export const setAuthCookies = (
  res: Response,
  accessToken?: string,
  refreshToken?: string
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN;

  // Tự động điều chỉnh SameSite dựa trên môi trường và kiến trúc
  // Nếu FE và BE khác site, bắt buộc phải là "none"
  const sameSitePolicy: "strict" | "lax" | "none" = isProduction
    ? process.env.CROSS_SITE === "true"
      ? "none"
      : "lax"
    : "lax";

  const commonOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSitePolicy,
    ...(cookieDomain && { domain: cookieDomain }),
  };

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      ...commonOptions,
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: "/api/v1/auth",
    });
  }

  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      ...commonOptions,
      maxAge: ACCESS_TOKEN_EXPIRY,
      path: "/api/v1",
    });
  }
};
