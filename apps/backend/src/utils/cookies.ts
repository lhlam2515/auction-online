import { Response } from "express";

export const setAuthCookies = (
  res: Response,
  accessToken?: string,
  refreshToken?: string
) => {
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/v1/auth",
    });
  }

  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/api/v1",
    });
  }
};
