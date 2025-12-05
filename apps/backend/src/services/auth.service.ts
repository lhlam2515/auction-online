import type { LoginResponse, UserRole } from "@repo/shared-types";
import { eq, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { supabase, supabaseAdmin } from "@/config/supabase";
import { otpVerifications, users } from "@/models";
import { emailService } from "@/services";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { generateOtp, getOtpExpiry } from "@/utils/jwt";

export class AuthService {
  async register(
    email: string,
    password: string,
    fullName: string,
    address: string
  ) {
    try {
      // Check if email already exists in database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (
        existingUser &&
        existingUser.accountStatus !== "PENDING_VERIFICATION"
      ) {
        // Security: Return generic message to prevent email enumeration
        throw new BadRequestError(
          "Registration failed. Please check your input and try again."
        );
      }

      // Create user in Supabase Auth (with auto email verification disabled)
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Skip email verification, we'll handle OTP
          user_metadata: {
            full_name: fullName,
          },
        });

      if (authError || !authData.user) {
        // Security: Return generic message
        throw new BadRequestError(
          "Registration failed. Please check your input and try again."
        );
      }

      // Generate unique username
      let username = email.split("@")[0];
      const existingUsernames = await db.query.users.findMany({
        where: sql`${users.username} LIKE ${username} || '%'`,
      });
      if (existingUsernames.length > 0) {
        username = `${username}${existingUsernames.length + 1}`;
      }

      // Create user profile in database with PENDING_VERIFICATION status
      const [newUser] = await db
        .insert(users)
        .values({
          id: authData.user.id,
          username,
          email: authData.user.email!,
          fullName,
          address,
        })
        .returning();

      if (!newUser) {
        throw new Error("Failed to create user profile");
      }

      // Generate 6-digit OTP and store in database
      const otpCode = generateOtp();
      const expiresAt = getOtpExpiry();

      await db.insert(otpVerifications).values({
        email,
        otpCode,
        expiresAt,
      });

      // Queue OTP email
      await emailService.queueOtpEmail(email, otpCode);

      return { message: "Registration successful. Please verify your email." };
    } catch (error) {
      // Don't reveal if email exists (security best practice)
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        "Registration failed. Please check your input and try again."
      );
    }
  }

  async verifyOtp(email: string, otpCode: string) {
    try {
      // Find the latest OTP verification record for this email
      const otpRecord = await db.query.otpVerifications.findFirst({
        where: eq(otpVerifications.email, email),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      if (!otpRecord) {
        throw new UnauthorizedError("No OTP verification found for this email");
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiresAt) {
        throw new UnauthorizedError(
          "OTP has expired. Please request a new one."
        );
      }

      // Check attempts limit (max 3 attempts)
      if (otpRecord.attempts >= 3) {
        throw new UnauthorizedError(
          "Too many failed attempts. Please request a new OTP."
        );
      }

      // Validate OTP code
      if (otpRecord.otpCode !== otpCode) {
        // Increment attempts
        await db
          .update(otpVerifications)
          .set({ attempts: sql`${otpVerifications.attempts} + 1` })
          .where(eq(otpVerifications.id, otpRecord.id));

        throw new UnauthorizedError("Invalid OTP code");
      }

      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Update user's accountStatus to ACTIVE
      const [updatedUser] = await db
        .update(users)
        .set({
          accountStatus: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundError("User not found");
      }

      // Clean up OTP record
      await db
        .delete(otpVerifications)
        .where(eq(otpVerifications.id, otpRecord.id));

      // Note: After OTP verification, user can now login normally
      // The client should redirect to login page or automatically login

      return { message: "Email verified successfully. You can now log in." };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new UnauthorizedError("OTP verification failed");
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user in database (for status check)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      // Check if user exists in database
      if (!existingUser) {
        // Security: Return generic message
        throw new UnauthorizedError("Invalid email or password");
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData.user || !authData.session) {
        // Security: Return generic message
        throw new UnauthorizedError("Invalid email or password");
      }

      // Check if account is BANNED
      if (existingUser.accountStatus === "BANNED") {
        throw new UnauthorizedError(
          "Your account has been banned. Please contact support."
        );
      }

      // Check if account is PENDING_VERIFICATION
      if (existingUser.accountStatus === "PENDING_VERIFICATION") {
        throw new UnauthorizedError(
          "Please verify your email address before logging in."
        );
      }

      return {
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          fullName: existingUser.fullName,
          role: existingUser.role as UserRole,
          avatarUrl: authData.user.user_metadata?.avatar_url || "",
          accountStatus: existingUser.accountStatus,
        },
        accessToken: authData.session.access_token || "",
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      // Security: Return generic message
      throw new UnauthorizedError("Invalid email or password");
    }
  }

  async logout(_userId: string) {
    // Supabase handles session cleanup on client side
    // This method can be used for server-side cleanup (audit logs, etc.)
    return { message: "Logged out successfully" };
  }

  async refreshToken(refreshToken: string) {
    // Refresh access token using refresh token from Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedError("Failed to refresh token");
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async forgotPassword(email: string) {
    // TODO: create reset token and send email
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!existing) throw new NotFoundError("Email not found");
    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    // TODO: verify reset token and update password
    throw new BadRequestError("Not implemented");
  }

  async verifyEmail(token: string) {
    // TODO: verify email token
    throw new BadRequestError("Not implemented");
  }

  async googleLogin(googleToken: string): Promise<LoginResponse> {
    // TODO: verify google token, upsert user, issue tokens
    throw new UnauthorizedError("Not implemented");
  }
}

export const authService = new AuthService();
