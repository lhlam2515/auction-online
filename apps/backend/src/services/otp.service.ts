import { eq, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { otpVerifications, users } from "@/models";
import { emailService } from "@/services";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { generateOtp, getOtpExpiry } from "@/utils/jwt";

export interface VerifyOtpResult {
  isValid: boolean;
  otpRecordId?: string;
  errorMessage?: string;
}

export class OtpService {
  async sendOtpEmail(email: string): Promise<{ otpCode: string }> {
    try {
      // Generate 6-digit OTP code
      const otpCode = generateOtp();
      const expiresAt = getOtpExpiry();

      // Store OTP in database
      await db.insert(otpVerifications).values({
        email,
        otpCode,
        expiresAt,
      });

      // Queue OTP email
      await emailService.queueOtpEmail(email, otpCode);

      return { otpCode };
    } catch (error) {
      throw new Error(
        `Failed to send OTP email: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
    try {
      // Find the latest OTP verification record for this email
      const otpRecord = await db.query.otpVerifications.findFirst({
        where: eq(otpVerifications.email, email),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      if (!otpRecord) {
        throw new UnauthorizedError(
          "No OTP request found for this email. Please request a new OTP."
        );
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiresAt) {
        throw new UnauthorizedError(
          "OTP has expired. Please request a new OTP."
        );
      }

      // Check attempts limit (max 3 attempts)
      if (otpRecord.attempts >= 3) {
        throw new UnauthorizedError(
          "Maximum OTP verification attempts exceeded. Please request a new OTP."
        );
      }

      // Validate OTP code
      if (otpRecord.otpCode !== otp) {
        // Increment attempts
        await db
          .update(otpVerifications)
          .set({ attempts: sql`${otpVerifications.attempts} + 1` })
          .where(eq(otpVerifications.id, otpRecord.id));

        throw new UnauthorizedError("Invalid OTP code. Please try again.");
      }

      // OTP is valid
      return {
        isValid: true,
        otpRecordId: otpRecord.id,
      };
    } catch (error) {
      // Re-throw known errors
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      // Handle unexpected errors
      throw new UnauthorizedError(
        `OTP verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async resendOtp(email: string) {
    try {
      // Check if user exists and is in PENDING_VERIFICATION status
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        // Security: Return generic message to prevent email enumeration
        throw new NotFoundError("User not found");
      }

      if (user.accountStatus !== "PENDING_VERIFICATION") {
        throw new BadRequestError(
          "Email is already verified or account is in an invalid state."
        );
      }

      // Clean up old OTP records for this email
      await db
        .delete(otpVerifications)
        .where(eq(otpVerifications.email, email));

      // Send new OTP email using OTP service
      await this.sendOtpEmail(email);

      return { message: "OTP code has been resent to your email address." };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        "Failed to resend OTP. Please try again later."
      );
    }
  }
}

export const otpService = new OtpService();
