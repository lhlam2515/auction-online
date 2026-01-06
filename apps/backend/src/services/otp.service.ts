import { and, eq, gt, sql, desc } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
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
}

export class OtpService {
  private readonly OTP_COOLDOWN_SECONDS = 30;
  private readonly MAX_ATTEMPTS = 3;

  async findValidOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<{ otpCode: string; expiresAt: Date } | null> {
    const otpRecord = await db.query.otpVerifications.findFirst({
      where: and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.purpose, purpose),
        gt(otpVerifications.expiresAt, new Date())
      ),
      orderBy: [desc(otpVerifications.createdAt)],
    });

    if (otpRecord) {
      return {
        otpCode: otpRecord.otpCode,
        expiresAt: otpRecord.expiresAt,
      };
    }

    return null;
  }

  async sendOtpEmail(
    email: string,
    purpose: OtpPurpose
  ): Promise<{ otpCode: string; expiresAt: Date }> {
    // 1. Rate Limiting Check: Kiểm tra OTP gần nhất
    const lastOtp = await db.query.otpVerifications.findFirst({
      where: and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.purpose, purpose)
      ),
      orderBy: [desc(otpVerifications.createdAt)],
    });

    if (lastOtp) {
      const now = new Date();
      const timeDiff = (now.getTime() - lastOtp.createdAt.getTime()) / 1000;

      if (timeDiff < this.OTP_COOLDOWN_SECONDS) {
        throw new Error(
          `Vui lòng chờ ${Math.ceil(
            this.OTP_COOLDOWN_SECONDS - timeDiff
          )} giây trước khi yêu cầu mã OTP mới.`
        );
      }
    }

    return await db.transaction(async (tx) => {
      // 2. Cleanup: Vô hiệu hóa tất cả OTP cũ của email+purpose này
      // Để đảm bảo chỉ có 1 OTP active tại 1 thời điểm
      await tx
        .delete(otpVerifications)
        .where(
          and(
            eq(otpVerifications.email, email),
            eq(otpVerifications.purpose, purpose)
          )
        );

      // 3. Generate & Save New OTP
      const otpCode = generateOtp();
      const expiresAt = getOtpExpiry();

      await tx.insert(otpVerifications).values({
        email,
        otpCode,
        purpose,
        expiresAt,
        attempts: 0,
        createdAt: new Date(), // Đảm bảo có field này để tính cooldown
      });

      // 4. Send Email (Side effect - sử dụng queue trong thực tế)
      // Nếu gửi mail lỗi, transaction sẽ rollback, không lưu OTP rác
      try {
        await emailService.sendOtpEmail(email, otpCode, purpose);
      } catch (err) {
        // Nếu mail server chết, throw error để rollback DB insert
        logger.error(
          `Send OTP email failed for ${email}: ${(err as Error).message}`
        );
        throw new Error("Không thể gửi email OTP. Vui lòng thử lại sau.");
      }

      return { otpCode, expiresAt };
    });
  }

  async verifyOtp(
    email: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<VerifyOtpResult> {
    const otpRecord = await db.query.otpVerifications.findFirst({
      where: and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.purpose, purpose)
      ),
      orderBy: [desc(otpVerifications.createdAt)],
    });

    if (!otpRecord) {
      throw new UnauthorizedError("Mã xác thực không tồn tại hoặc đã hết hạn.");
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new UnauthorizedError(
        "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới."
      );
    }

    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      throw new UnauthorizedError(
        "Bạn đã nhập sai quá số lần quy định. Vui lòng yêu cầu mã mới."
      );
    }

    if (otpRecord.otpCode !== otp) {
      // ATOMIC UPDATE: Tăng số lần thử ngay lập tức để tránh Race Condition
      await db
        .update(otpVerifications)
        .set({ attempts: sql`${otpVerifications.attempts} + 1` })
        .where(eq(otpVerifications.id, otpRecord.id));

      throw new UnauthorizedError("Mã xác thực không chính xác.");
    }

    // Lưu ý: Không xóa OTP ngay tại đây.
    // Việc xóa sẽ do AuthService thực hiện SAU KHI các logic nghiệp vụ khác thành công.
    return {
      isValid: true,
      otpRecordId: otpRecord.id,
    };
  }

  async resendOtp(email: string, purpose: OtpPurpose = "EMAIL_VERIFICATION") {
    // 1. Check User Existence & Status
    // Logic này giữ nguyên vì nó bảo vệ nghiệp vụ đúng đắn
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { accountStatus: true },
    });

    // Xử lý bảo mật: Chống User Enumeration
    if (!user) {
      if (purpose === "PASSWORD_RESET") {
        // Fake success message
        return { message: "Nếu email tồn tại, mã OTP mới đã được gửi." };
      }
      throw new NotFoundError("Email không tồn tại trong hệ thống.");
    }

    if (
      purpose === "EMAIL_VERIFICATION" &&
      user.accountStatus !== "PENDING_VERIFICATION"
    ) {
      throw new BadRequestError(
        "Tài khoản đã được xác minh hoặc đang bị khóa."
      );
    }

    if (purpose === "PASSWORD_RESET" && user.accountStatus !== "ACTIVE") {
      return { message: "Nếu email tồn tại, mã OTP mới đã được gửi." };
    }

    await this.sendOtpEmail(email, purpose);

    if (purpose === "PASSWORD_RESET") {
      return { message: "Nếu email tồn tại, mã OTP mới đã được gửi." };
    }
    return { message: "Mã xác thực mới đã được gửi đến email của bạn." };
  }

  async cleanupOtpAfterVerification(
    otpRecordId: string,
    tx?: Parameters<Parameters<typeof db.transaction>[0]>[0]
  ) {
    const executor = tx ?? db;
    await executor
      .delete(otpVerifications)
      .where(eq(otpVerifications.id, otpRecordId));
  }
}

export const otpService = new OtpService();
