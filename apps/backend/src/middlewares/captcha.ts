import { Request, Response, NextFunction } from "express";

import { BadRequestError } from "@/utils/errors";

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

export const verifyCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get reCaptcha token from request body
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      throw new BadRequestError("reCaptcha token is required");
    }

    const secretKey = process.env.CAPTCHA_SECRET_KEY;
    if (!secretKey) {
      throw new Error("RECAPTCHA_SECRET_KEY not configured");
    }

    // Verify token with Google reCaptcha API
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
      }
    );

    const data = (await response.json()) as RecaptchaResponse;

    // reCaptcha v2: Check success flag
    // reCaptcha v3: Check success flag and score (typically >= 0.5)
    if (!data.success) {
      throw new BadRequestError(
        "reCaptcha verification failed. Please try again."
      );
    }

    // For reCaptcha v3, check score if available (0.0 = likely bot, 1.0 = likely human)
    if (typeof data.score === "number" && data.score < 0.5) {
      throw new BadRequestError(
        "reCaptcha verification failed. Please try again."
      );
    }

    // Verification passed, continue to next middleware
    next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      next(error);
    } else {
      next(
        new BadRequestError("reCaptcha verification failed. Please try again.")
      );
    }
  }
};
