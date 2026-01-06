import type { UserAuthData, UserRole } from "@repo/shared-types";
import { and, eq, like, sql } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { supabase, supabaseAdmin } from "@/config/supabase";
import { passwordResetTokens, users, products } from "@/models";
import { otpService } from "@/services";
import { generateUniqueUsername } from "@/utils";
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
    const userProfile = await db.query.users.findFirst({
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

    if (!userProfile) {
      throw new UnauthorizedError("Không tìm thấy thông tin người dùng.");
    }

    if (userProfile.accountStatus === "BANNED") {
      throw new UnauthorizedError(
        "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ."
      );
    }

    if (userProfile.accountStatus === "PENDING_VERIFICATION") {
      throw new UnverifiedEmailError(
        "Vui lòng xác minh địa chỉ email trước khi đăng nhập."
      );
    }

    // Check if user has any products (for seller access control)
    let hasActiveProducts = false;
    if (userProfile.role === "SELLER") {
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
      ...userProfile,
      avatarUrl: userProfile.avatarUrl || "",
      sellerExpireDate: userProfile.sellerExpireDate
        ? userProfile.sellerExpireDate.toISOString()
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
    let supabaseUserId: string | null = null;

    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: { id: true, accountStatus: true },
      });

      if (
        existingUser &&
        existingUser.accountStatus !== "PENDING_VERIFICATION"
      ) {
        throw new BadRequestError(
          "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
        );
      }

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
        throw new BadRequestError(
          "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
        );
      }
      supabaseUserId = authData.user.id; // Lưu ID để rollback

      await db.transaction(async (tx) => {
        // Xử lý Username an toàn hơn: Dùng Random suffix thay vì đếm số
        const username = await generateUniqueUsername(email);

        await tx.insert(users).values({
          id: authData.user!.id,
          username,
          email: authData.user!.email!,
          fullName,
          address,
          accountStatus: "PENDING_VERIFICATION",
        });

        await otpService.sendOtpEmail(email, "EMAIL_VERIFICATION");
      });

      return {
        message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh.",
      };
    } catch (error) {
      // Rollback: Xóa user Supabase nếu DB insert thất bại
      if (supabaseUserId) {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
      }

      if (error instanceof BadRequestError) throw error;

      logger.error("Register Error:", error);
      throw new BadRequestError("Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  }

  async verifyEmail(email: string, otp: string) {
    const verificationResult = await otpService.verifyOtp(
      email,
      otp,
      "EMAIL_VERIFICATION"
    );

    if (!verificationResult.isValid || !verificationResult.otpRecordId) {
      throw new UnauthorizedError("Xác minh OTP thất bại");
    }

    await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(users)
        .set({
          accountStatus: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(eq(users.email, email))
        .returning({ id: users.id });

      if (!updatedUser) {
        // Trường hợp hy hữu: OTP đúng nhưng User không tồn tại (đã bị xóa?)
        throw new NotFoundError("Không tìm thấy người dùng để kích hoạt.");
      }

      // Cleanup OTP trong cùng transaction
      await otpService.cleanupOtpAfterVerification(
        verificationResult.otpRecordId!,
        tx
      );
    });

    return {
      message: "Xác minh email thành công. Bạn có thể đăng nhập ngay bây giờ.",
    };
  }

  async login(email: string, password: string) {
    try {
      // 1. SECURITY FIX: Authenticate with Supabase FIRST
      // Để tránh Timing Attack: Luôn tốn thời gian verify password trước
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData.user || !authData.session) {
        throw new UnauthorizedError("Email hoặc mật khẩu không hợp lệ");
      }

      // 2. Fetch user profile AFTER authentication
      // Dùng ID từ Supabase để query (nhanh hơn query bằng email vì là Primary Key)
      const userProfile = await db.query.users.findFirst({
        where: eq(users.id, authData.user.id),
      });

      // Trường hợp hy hữu: Có trên Supabase nhưng không có trong DB local (Lỗi đồng bộ)
      if (!userProfile) {
        throw new UnauthorizedError("Không tìm thấy thông tin người dùng.");
      }

      // 3. Check status checks
      if (userProfile.accountStatus === "BANNED") {
        throw new UnauthorizedError(
          "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ."
        );
      }

      if (userProfile.accountStatus === "PENDING_VERIFICATION") {
        throw new UnverifiedEmailError(
          "Vui lòng xác minh địa chỉ email trước khi đăng nhập."
        );
      }

      // Check if user has any products (for seller access control)
      let hasActiveProducts = false;
      if (userProfile.role === "SELLER") {
        const productCount = await db.query.products.findFirst({
          where: and(
            eq(products.sellerId, userProfile.id),
            eq(products.status, "ACTIVE")
          ),
          columns: { id: true },
        });
        hasActiveProducts = !!productCount;
      }

      // 4. Prepare UserAuthData response
      const userData: UserAuthData = {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        fullName: userProfile.fullName,
        role: userProfile.role as UserRole, // Cast enum nếu cần
        avatarUrl: userProfile.avatarUrl || undefined, // Handle null vs undefined
        accountStatus: userProfile.accountStatus,
        sellerExpireDate: userProfile.sellerExpireDate?.toISOString() ?? null,
        hasActiveProducts,
      };

      return {
        user: userData,
        accessToken: authData.session.access_token || "",
        refreshToken: authData.session.refresh_token || "",
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof UnverifiedEmailError
      ) {
        throw error;
      }

      logger.error("Login Error:", error);
      throw new UnauthorizedError("Email hoặc mật khẩu không hợp lệ");
    }
  }

  async logout(accessToken: string) {
    try {
      // Hành động này sẽ vô hiệu hóa Refresh Token hiện tại và các token liên quan.
      // scope: 'global' sẽ đăng xuất user khỏi TẤT CẢ các thiết bị (An toàn nhất)
      const { error } = await supabaseAdmin.auth.admin.signOut(
        accessToken,
        "global"
      );

      if (error) {
        logger.error(`Logout failed:`, error);
      }

      return { message: "Đăng xuất thành công" };
    } catch (error) {
      // Không throw error chặn luồng logout của user
      logger.error("Logout system error:", error);
      return { message: "Đăng xuất thành công" };
    }
  }

  async refreshToken(incomingRefreshToken: string) {
    // 1. Refresh session với Supabase trước
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: incomingRefreshToken,
    });

    if (error || !data.user || !data.session) {
      // Lỗi này thường do Refresh Token hết hạn hoặc đã bị thu hồi (Reuse detection)
      throw new UnauthorizedError(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
    }

    try {
      // 2. SECURITY CRITICAL: Kiểm tra trạng thái User trong DB
      // Ngăn chặn trường hợp User đã bị BAN nhưng Refresh Token vẫn còn hạn
      const userStatus = await db.query.users.findFirst({
        where: eq(users.id, data.user.id),
        columns: {
          id: true,
          accountStatus: true,
          role: true,
        },
      });

      if (!userStatus) {
        // User bị xóa khỏi DB nhưng vẫn còn bên Supabase Auth
        // -> Xóa luôn user khỏi Supabase Auth để dọn dẹp dữ liệu rác
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        throw new UnauthorizedError("Tài khoản không tồn tại.");
      }

      if (userStatus.accountStatus === "BANNED") {
        // User bị cấm -> Thu hồi ngay token vừa cấp -> Chặn truy cập
        // Sử dụng access token vừa refresh để signOut
        await supabaseAdmin.auth.admin.signOut(
          data.session.access_token,
          "global"
        );
        throw new UnauthorizedError("Tài khoản của bạn đã bị vô hiệu hóa.");
      }

      // 3. (Optional) Update 'Last Active' timestamp
      // Giúp tracking user online/offline mà không cần socket
      // Dùng update nhẹ, không cần await để không block response (Fire & Forget)
      db.update(users)
        .set({ updatedAt: new Date() })
        .where(eq(users.id, userStatus.id))
        .execute()
        .catch((err) => logger.error("Update last active failed", err));

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;

      logger.error("RefreshToken Logic Error:", error);
      throw new UnauthorizedError("Không thể làm mới phiên đăng nhập.");
    }
  }

  async forgotPassword(email: string) {
    try {
      // Chỉ lấy status, không select *
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: { id: true, accountStatus: true },
      });

      if (user && user.accountStatus === "ACTIVE") {
        const existingOtp = await otpService.findValidOtp(
          email,
          "PASSWORD_RESET"
        );
        if (!existingOtp) {
          await otpService.sendOtpEmail(email, "PASSWORD_RESET");
        }
      } else {
        // FAKE DELAY: Nếu không tìm thấy user, ta vẫn chờ một chút
        // để kẻ tấn công không đoán được qua thời gian phản hồi.
        // Thời gian chờ nên tương đương thời gian gửi mail trung bình (vd: 500ms - 1000ms)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 500 + 500)
        );
      }

      return {
        message:
          "Nếu email này tồn tại, một OTP đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.",
      };
    } catch (error) {
      logger.error("Forgot Password Error:", error);
      return {
        message:
          "Nếu email này tồn tại, một OTP đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn.",
      };
    }
  }

  async verifyResetOtp(email: string, otp: string) {
    const verificationResult = await otpService.verifyOtp(
      email,
      otp,
      "PASSWORD_RESET"
    );

    if (!verificationResult.isValid || !verificationResult.otpRecordId) {
      throw new UnauthorizedError("Mã xác thực không hợp lệ hoặc đã hết hạn.");
    }

    return await db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        where: eq(users.email, email),
        columns: { accountStatus: true },
      });

      if (!user) throw new NotFoundError("Người dùng không tồn tại.");

      if (user.accountStatus !== "ACTIVE") {
        throw new BadRequestError(
          "Tài khoản chưa được kích hoạt hoặc đã bị khóa."
        );
      }

      const resetToken = generateResetToken();
      const expiresAt = getResetTokenExpiry();

      // Xóa các token cũ của email này (nếu có) để tránh rác DB
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.email, email));

      await tx.insert(passwordResetTokens).values({
        email,
        token: resetToken,
        otpRecordId: verificationResult.otpRecordId!,
        expiresAt,
      });

      return { resetToken, expiresAt };
    });
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const resetTokenRecord = await db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.token, resetToken),
      });

      if (!resetTokenRecord) {
        throw new UnauthorizedError("Token không hợp lệ hoặc đã được sử dụng.");
      }

      if (new Date() > resetTokenRecord.expiresAt) {
        // Token hết hạn -> Xóa luôn cho sạch DB
        await db
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.token, resetToken));
        throw new UnauthorizedError(
          "Token đã hết hạn. Vui lòng thực hiện lại."
        );
      }

      const user = await db.query.users.findFirst({
        where: eq(users.email, resetTokenRecord.email),
        columns: { id: true, accountStatus: true },
      });

      if (!user || user.accountStatus !== "ACTIVE") {
        throw new BadRequestError("Tài khoản không hợp lệ.");
      }

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: newPassword,
        });

      if (updateError) {
        throw new BadRequestError(`Lỗi hệ thống: ${updateError.message}`);
      }

      await db.transaction(async (tx) => {
        // Xóa Token đặt lại mật khẩu để KHÔNG THỂ DÙNG LẠI (Replay Attack Protection)
        await tx
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.token, resetToken));

        // Xóa OTP liên quan (nếu chưa xóa ở bước trước)
        if (resetTokenRecord.otpRecordId) {
          await otpService.cleanupOtpAfterVerification(
            resetTokenRecord.otpRecordId,
            tx
          );
        }
      });

      // Sau khi đổi mật khẩu, Supabase tự động vô hiệu hóa các session cũ
      // User cần đăng nhập lại với mật khẩu mới

      return {
        message: "Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.",
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof BadRequestError
      )
        throw error;

      logger.error("Reset Password Error:", error);
      throw new BadRequestError("Đổi mật khẩu thất bại. Vui lòng thử lại.");
    }
  }

  async signInWithOAuth(provider: "google" | "facebook", redirectTo: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error || !data.url) {
        throw new ExternalServiceError("OAuth sign-in failed");
      }

      return { redirectUrl: data.url };
    } catch (error) {
      logger.error("OAuth Sign-In Error:", error);
      throw new ExternalServiceError(
        "Đăng nhập OAuth thất bại. Vui lòng thử lại sau."
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

      await db.transaction(async (tx) => {
        const existingUser = await tx.query.users.findFirst({
          where: eq(users.email, user.email!),
          columns: { id: true, accountStatus: true },
        });

        // Nếu user chưa tồn tại, tạo mới
        if (!existingUser) {
          const username = await generateUniqueUsername(user.email!);

          await tx.insert(users).values({
            id: user.id,
            username,
            email: user.email!,
            fullName: user.user_metadata.full_name || "Unknown",
            address: user.user_metadata.address || "Unknown",
            avatarUrl: user.user_metadata.avatar_url || "",
            accountStatus: "ACTIVE",
          });
        } else {
          // Nếu user tồn tại, chỉ cần update avatar/info từ OAuth provider
          if (existingUser.accountStatus === "BANNED") {
            throw new UnauthorizedError(
              "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ."
            );
          }

          // Cập nhật thông tin người dùng từ metadata
          await tx
            .update(users)
            .set({
              fullName: user.user_metadata.full_name || undefined,
              avatarUrl: user.user_metadata.avatar_url || "",
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id));
        }
      });

      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error("OAuth Callback Error:", error);
      throw new ExternalServiceError(
        "Xử lý callback OAuth thất bại. Vui lòng thử lại sau."
      );
    }
  }
}

export const authService = new AuthService();
