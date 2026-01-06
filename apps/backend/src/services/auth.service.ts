import type { UserAuthData, UserRole } from "@repo/shared-types";
import { and, eq, like, sql } from "drizzle-orm";

import { db } from "@/config/database";
import { supabase, supabaseAdmin } from "@/config/supabase";
import { passwordResetTokens, users, products } from "@/models";
import { otpService } from "@/services";
import {
  BadRequestError,
  ExternalServiceError,
  NotFoundError,
  UnauthorizedError,
  UnverifiedEmailError,
} from "@/utils/errors";
import { generateResetToken, getResetTokenExpiry } from "@/utils/jwt";

export class AuthService {
  async getAuthData(userId: string): Promise<UserAuthData> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        birthDate: false,
        address: false,
        ratingScore: false,
        ratingCount: false,
        createdAt: false,
        updatedAt: false,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user has any products (for seller access control)
    let hasActiveProducts = false;
    if (user.role === "SELLER") {
      const productCount = await db.query.products.findFirst({
        where: and(
          eq(products.sellerId, userId),
          eq(products.status, "ACTIVE")
        ),
        columns: { id: true },
      });
      hasActiveProducts = !!productCount;
    }

    return {
      ...user,
      avatarUrl: user.avatarUrl || "",
      sellerExpireDate: user.sellerExpireDate
        ? user.sellerExpireDate.toISOString()
        : null,
      hasActiveProducts,
    };
  }

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
          "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
        );
      }

      // Create user in Supabase Auth (with email verification enabled)
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

      if (authError || !authData.user) {
        // Security: Return generic message
        throw new BadRequestError(
          "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
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

      // Send OTP email using OTP service
      await otpService.sendOtpEmail(email, "EMAIL_VERIFICATION");

      return {
        message: "Đăng ký thành công. Vui lòng xác minh email của bạn.",
      };
    } catch (error) {
      // Don't reveal if email exists (security best practice)
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
      );
    }
  }

  async verifyEmail(email: string, otp: string) {
    try {
      // Verify OTP using OTP service (for email verification)
      const verificationResult = await otpService.verifyOtp(
        email,
        otp,
        "EMAIL_VERIFICATION"
      );

      if (!verificationResult.isValid || !verificationResult.otpRecordId) {
        throw new UnauthorizedError("Xác minh OTP thất bại");
      }

      // Find user in database by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new NotFoundError("Không tìm thấy người dùng");
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

      // Clean up OTP record after successful verification
      await otpService.cleanupOtpAfterVerification(
        verificationResult.otpRecordId
      );

      return {
        message:
          "Xác minh email thành công. Bạn có thể đăng nhập ngay bây giờ.",
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new UnauthorizedError(
        `Xác minh email thất bại: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user in database (for status check)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      // Check if user exists in database
      if (!existingUser) {
        // Security: Return generic message
        throw new UnauthorizedError("Email hoặc mật khẩu không hợp lệ");
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData.user || !authData.session) {
        // Security: Return generic message
        throw new UnauthorizedError("Email hoặc mật khẩu không hợp lệ");
      }

      // Check if account is BANNED
      if (existingUser.accountStatus === "BANNED") {
        throw new UnauthorizedError(
          "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ."
        );
      }

      // Check if account is PENDING_VERIFICATION
      if (existingUser.accountStatus === "PENDING_VERIFICATION") {
        throw new UnverifiedEmailError(
          "Vui lòng xác minh địa chỉ email trước khi đăng nhập."
        );
      }

      // Check if user has any products (for seller access control)
      let hasProducts = false;
      if (existingUser.role === "SELLER") {
        const productCount = await db.query.products.findFirst({
          where: eq(products.sellerId, existingUser.id),
          columns: { id: true },
        });
        hasProducts = !!productCount;
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
          sellerExpireDate:
            existingUser.sellerExpireDate?.toISOString() || null,
          hasProducts,
        },
        accessToken: authData.session.access_token || "",
        refreshToken: authData.session.refresh_token || "",
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      // Security: Return generic message
      throw new UnauthorizedError("Email hoặc mật khẩu không hợp lệ");
    }
  }

  async logout(_userId: string) {
    // Supabase handles session cleanup on client side
    // This method can be used for server-side cleanup (audit logs, etc.)
    return { message: "Đăng xuất thành công" };
  }

  async refreshToken(refreshToken: string) {
    // Refresh access token using refresh token from Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedError("Không thể làm mới token");
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async forgotPassword(email: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      // Only process if user exists and account is ACTIVE
      if (user && user.accountStatus === "ACTIVE") {
        // Check for existing valid OTP before sending a new one
        const existingOtp = await otpService.findValidOtp(
          email,
          "PASSWORD_RESET"
        );
        if (!existingOtp) {
          await otpService.sendOtpEmail(email, "PASSWORD_RESET");
        }
      }

      return {
        message:
          "Nếu email này tồn tại, một OTP đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.",
      };
    } catch {
      return {
        message:
          "Nếu email này tồn tại, một OTP đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.",
      };
    }
  }

  async verifyResetOtp(email: string, otp: string) {
    try {
      const verificationResult = await otpService.verifyOtp(
        email,
        otp,
        "PASSWORD_RESET"
      );

      if (!verificationResult.isValid || !verificationResult.otpRecordId) {
        throw new UnauthorizedError("Xác minh OTP thất bại");
      }

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new NotFoundError("Không tìm thấy người dùng");
      }

      if (user.accountStatus !== "ACTIVE") {
        throw new BadRequestError(
          "Đặt lại mật khẩu chỉ được phép cho tài khoản đang hoạt động."
        );
      }

      // Generate reset token and store it in database
      const resetToken = generateResetToken();
      const expiresAt = getResetTokenExpiry();

      await db.insert(passwordResetTokens).values({
        email,
        token: resetToken,
        otpRecordId: verificationResult.otpRecordId,
        expiresAt,
      });

      return {
        resetToken,
        expiresAt,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new UnauthorizedError(
        `Xác minh OTP thất bại: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    }
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const resetTokenRecord = await db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.token, resetToken),
      });

      if (!resetTokenRecord) {
        throw new UnauthorizedError(
          "Token đặt lại không hợp lệ hoặc đã hết hạn."
        );
      }

      // Check if reset token is expired
      if (new Date() > resetTokenRecord.expiresAt) {
        throw new UnauthorizedError(
          "Token đặt lại đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới."
        );
      }

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, resetTokenRecord.email),
      });

      if (!user) {
        throw new NotFoundError("Không tìm thấy người dùng");
      }

      if (user.accountStatus !== "ACTIVE") {
        throw new BadRequestError(
          "Đặt lại mật khẩu chỉ được phép cho tài khoản đang hoạt động."
        );
      }

      // Update password in Supabase Auth (using Admin API)
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: newPassword,
        });

      if (updateError) {
        throw new BadRequestError(
          `Không thể cập nhật mật khẩu: ${updateError.message}`
        );
      }

      // Clean up OTP record after successful password reset
      await otpService.cleanupOtpAfterVerification(
        resetTokenRecord.otpRecordId
      );

      return {
        message:
          "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.",
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new BadRequestError(
        `Đặt lại mật khẩu thất bại: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    }
  }

  async signInWithOAuth(provider: "google" | "facebook", redirectTo: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error || !data.url) {
        throw new ExternalServiceError("OAuth sign-in failed");
      }

      return { redirectUrl: data.url };
    } catch (error) {
      throw new ExternalServiceError(
        `OAuth sign-in failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async handleOAuthCallback(code: string) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.user || !data.session) {
        throw new ExternalServiceError("OAuth callback failed");
      }

      const { session, user } = data;

      if (!user.email) {
        throw new UnauthorizedError("Email người dùng chưa được xác minh");
      }

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      });

      // If user does not exist in our database, create a new profile
      if (!existingUser) {
        const fullName =
          user.user_metadata.full_name ||
          user.user_metadata.display_name ||
          "Unknown";
        const address = user.user_metadata.address || "Unknown";

        // Generate unique username
        let username = user.email!.split("@")[0];
        const existingUsernames = await db.query.users.findMany({
          where: like(users.username, `${username}%`),
        });
        if (existingUsernames.length > 0) {
          username = `${username}${existingUsernames.length + 1}`;
        }

        const [newUser] = await db
          .insert(users)
          .values({
            id: user.id,
            username,
            email: user.email!,
            fullName,
            address,
            avatarUrl: user.user_metadata.avatar_url || "",
            accountStatus: "ACTIVE",
          })
          .returning();

        if (!newUser) {
          throw new Error("Tạo hồ sơ người dùng thất bại");
        }
      } else {
        // If user exists but is BANNED, prevent login
        if (existingUser.accountStatus === "BANNED") {
          throw new UnauthorizedError(
            "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ."
          );
        }

        // Update existing user's avatar URL from OAuth provider
        const [updatedUser] = await db
          .update(users)
          .set({
            avatarUrl: existingUser.avatarUrl || user.user_metadata.avatar_url,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();

        if (!updatedUser) {
          throw new Error("Cập nhật hồ sơ người dùng thất bại");
        }
      }

      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new ExternalServiceError(
        `OAuth callback failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export const authService = new AuthService();
