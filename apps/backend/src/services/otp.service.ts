import { and, eq, lt, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { otpVerifications, users } from "@/models";
import { emailService } from "@/services";
import { OtpPurpose } from "@/types/model";
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

interface CleanupOptions {
  email?: string;
  purpose?: OtpPurpose;
  otpRecordId?: string;
  expired?: boolean;
  maxAttemptsExceeded?: boolean;
}

export class OtpService {
  async sendOtpEmail(
    email: string,
    purpose: OtpPurpose
  ): Promise<{ otpCode: string }> {
    try {
      // Generate 6-digit OTP code
      const otpCode = generateOtp();
      const expiresAt = getOtpExpiry();

      // Store OTP in database
      await db.insert(otpVerifications).values({
        email,
        otpCode,
        purpose,
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

  async verifyOtp(
    email: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<VerifyOtpResult> {
    try {
      // Find the latest OTP verification record for this email
      let otpRecord;

      if (purpose) {
        // Query with purpose filter
        const records = await db
          .select()
          .from(otpVerifications)
          .where(
            and(
              eq(otpVerifications.email, email),
              eq(otpVerifications.purpose, purpose)
            )
          )
          .orderBy(sql`${otpVerifications.createdAt} DESC`)
          .limit(1);

        otpRecord = records[0];
      } else {
        otpRecord = await db.query.otpVerifications.findFirst({
          where: eq(otpVerifications.email, email),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        });
      }

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

  async resendOtp(email: string, purpose: OtpPurpose = "EMAIL_VERIFICATION") {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        // Security: Return generic message to prevent email enumeration
        // For PASSWORD_RESET, we still return success message
        if (purpose === "PASSWORD_RESET") {
          return {
            message:
              "If this email exists, a password reset OTP has been resent to your email address.",
          };
        }
        throw new NotFoundError("User not found");
      }

      // Validate account status based on purpose
      if (purpose === "EMAIL_VERIFICATION") {
        // For email verification, only allow if account is PENDING_VERIFICATION
        if (user.accountStatus !== "PENDING_VERIFICATION") {
          throw new BadRequestError(
            "Email is already verified or account is in an invalid state."
          );
        }
      } else if (purpose === "PASSWORD_RESET") {
        // For password reset, only allow if account is ACTIVE
        if (user.accountStatus !== "ACTIVE") {
          // Security: Return generic message for non-active accounts
          return {
            message:
              "If this email exists, a password reset OTP has been resent to your email address.",
          };
        }
      }

      // Clean up old OTP records before sending new one (only when resending)
      await this.cleanupOldOtpsForResend(email, purpose);

      // Send new OTP email using OTP service
      await this.sendOtpEmail(email, purpose);

      // Return appropriate message based on purpose
      if (purpose === "PASSWORD_RESET") {
        return {
          message:
            "If this email exists, a password reset OTP has been resent to your email address.",
        };
      }

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

  private async cleanupOtps(options: CleanupOptions) {
    if (options.otpRecordId) {
      await db
        .delete(otpVerifications)
        .where(eq(otpVerifications.id, options.otpRecordId));
      return;
    }

    const conditions: Array<
      ReturnType<typeof eq> | ReturnType<typeof lt> | ReturnType<typeof sql>
    > = [];

    if (options.email) {
      conditions.push(eq(otpVerifications.email, options.email));
    }

    if (options.purpose) {
      conditions.push(eq(otpVerifications.purpose, options.purpose));
    }

    if (options.expired) {
      conditions.push(lt(otpVerifications.expiresAt, new Date()));
    }

    if (options.maxAttemptsExceeded) {
      conditions.push(sql`${otpVerifications.attempts} >= 3`);
    }

    if (conditions.length > 0) {
      await db
        .delete(otpVerifications)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }
  }

  async cleanupOldOtpsForResend(email: string, purpose: OtpPurpose) {
    await this.cleanupOtps({ email, purpose });
  }

  async cleanupOtpAfterVerification(otpRecordId: string) {
    await this.cleanupOtps({ otpRecordId });
  }

  async cleanupExpiredOtps() {
    await this.cleanupOtps({ expired: true });
  }
}

export const otpService = new OtpService();
