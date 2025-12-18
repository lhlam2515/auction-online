import type { OtpPurpose } from "@repo/shared-types";

import logger from "@/config/logger";
import transporter, { MAILER_FROM, MailerTransporter } from "@/config/mailer";
import { emailQueue } from "@/config/queue";

// Cấu hình nội dung cho OTP
const OTP_CONTENT = {
  EMAIL_VERIFICATION: {
    subject: "Xác thực tài khoản mới",
    title: "Chào mừng bạn gia nhập!",
    desc: "Cảm ơn bạn đã đăng ký. Để hoàn tất việc tạo tài khoản, vui lòng nhập mã xác thực dưới đây:",
  },
  PASSWORD_RESET: {
    subject: "Xác thực đặt lại mật khẩu",
    title: "Quên mật khẩu?",
    desc: "Chúng tôi nhận được yêu cầu lấy lại mật khẩu. Sử dụng mã OTP dưới đây để tiến hành đặt lại:",
  },
};

// Bảng màu hệ thống (Mapping từ CSS Variables)
const COLORS = {
  background: "#ffffff",
  foreground: "#020618", // Màu chữ chính (Đen xanh)
  primary: "#1447e6", // Màu chủ đạo (Xanh dương rực rỡ)
  primaryFg: "#f8fafc", // Chữ trên nền chủ đạo (Trắng)
  secondary: "#e2e8f0", // Nền phụ (Xám nhạt)
  secondaryFg: "#0f172b", // Chữ trên nền phụ
  muted: "#f1f5f9", // Nền footer/quote
  mutedFg: "#62748e", // Chữ phụ/footer
  destructive: "#e7000b", // Màu cảnh báo/Lỗi (Đỏ)
  border: "#e2e8f0", // Viền
};

class EmailService {
  private transporter: MailerTransporter;
  private mailerFrom: string = MAILER_FROM;

  constructor() {
    this.transporter = transporter;
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      const check = await this.transporter.verify();
      if (check) {
        logger.info(`✅ Mailer Configured & Ready with ${this.mailerFrom}`);
      }
    } catch (error) {
      logger.error("❌ Email Server Connection Error:", error);
    }
  }

  // ============================================================
  // GROUP 1: AUTHENTICATION (Xác thực & Bảo mật)
  // ============================================================

  public sendOtpEmail(
    email: string,
    otpCode: string,
    type: OtpPurpose,
    expiresIn: number = 5,
    userName?: string
  ) {
    const content = OTP_CONTENT[type];
    const greeting = userName
      ? `Xin chào <strong>${userName}</strong>,`
      : "Xin chào,";

    const htmlBody = `
      <p style="margin-bottom: 20px;">${greeting}</p>
      <p>${content.desc}</p>

      <div style="background: ${COLORS.secondary}; border: 1px dashed ${COLORS.primary}; padding: 25px; text-align: center; margin: 30px 0; border-radius: 8px;">
         <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${COLORS.primary}; display: block;">
           ${otpCode}
         </span>
         <span style="font-size: 13px; color: ${COLORS.secondaryFg}; display: block; margin-top: 10px; font-weight: 500;">
           (Hết hạn sau ${expiresIn} phút)
         </span>
      </div>

      <p style="font-size: 14px; color: ${COLORS.mutedFg}; font-style: italic; border-left: 3px solid ${COLORS.destructive}; padding-left: 10px;">
        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua và không chia sẻ nó cho bất kỳ ai.
      </p>
    `;

    const fullHtml = this.getBaseTemplate(content.title, htmlBody);
    this.queueEmail(email, content.subject, fullHtml);
  }

  // ============================================================
  // GROUP 2: BIDDING ACTIONS (Hành động Ra giá)
  // ============================================================

  /**
   * 1. RA GIÁ THÀNH CÔNG -> Gửi cho Người ra giá (Bidder)
   */
  public notifyBidSuccess(
    email: string,
    productName: string,
    price: number,
    productLink: string
  ) {
    const priceStr = price.toLocaleString("vi-VN");
    const html = this.getBaseTemplate(
      "Ra giá thành công",
      `<p>Hệ thống đã ghi nhận mức giá của bạn cho sản phẩm <strong>${productName}</strong>.</p>
       <p style="font-size: 18px;">Giá hiện tại của bạn: <strong style="color: ${COLORS.primary}; font-size: 22px;">${priceStr} đ</strong></p>
       <p>Chúc bạn may mắn và chiến thắng phiên đấu giá này.</p>`,
      { link: productLink, text: "Xem sản phẩm" }
    );
    this.queueEmail(email, `[Thành công] Bạn đã ra giá ${productName}`, html);
  }

  /**
   * 2. RA GIÁ THÀNH CÔNG -> Gửi cho Người bán (Seller)
   */
  public notifySellerNewBid(
    email: string,
    productName: string,
    newPrice: number,
    bidderName: string,
    productLink: string
  ) {
    const html = this.getBaseTemplate(
      "Sản phẩm có giá mới 💰",
      `<p>Khách hàng <strong>${bidderName}</strong> vừa ra mức giá mới cho sản phẩm <strong>${productName}</strong>.</p>
       <p>Giá hiện tại: <strong>${newPrice.toLocaleString("vi-VN")} đ</strong></p>`,
      { link: productLink, text: "Theo dõi đấu giá" }
    );
    this.queueEmail(email, `[Cập nhật] Giá mới cho ${productName}`, html);
  }

  /**
   * 3. RA GIÁ THÀNH CÔNG -> Gửi cho Người giữ giá cũ (Previous Bidder - Bị Outbid)
   */
  public notifyOutbidAlert(
    email: string,
    productName: string,
    newPrice: number,
    productLink: string
  ) {
    const priceStr = newPrice.toLocaleString("vi-VN");
    const html = this.getBaseTemplate(
      `Cảnh báo: Bạn đã bị vượt giá!`,
      `<p>Đừng để tuột mất sản phẩm <strong style="color: ${COLORS.primary};">${productName}</strong> mà bạn yêu thích.</p>

       <div style="background-color: #fff1f2; border-left: 4px solid ${COLORS.destructive}; padding: 15px; margin: 20px 0; color: ${COLORS.destructive};">
          <p style="margin: 0; font-weight: bold;">⚠️ Đã có người trả giá cao hơn: ${priceStr} đ</p>
       </div>

       <p>Hãy hành động ngay trước khi phiên đấu giá kết thúc!</p>`,
      { link: productLink, text: "Ra giá lại ngay" }
    );
    this.queueEmail(
      email,
      `[Báo động] Bạn đã bị vượt giá ${productName}`,
      html
    );
  }

  /**
   * 4. NGƯỜI MUA BỊ TỪ CHỐI RA GIÁ (Bid Rejected)
   */
  public notifyBidRejected(
    email: string,
    productName: string,
    reason: string,
    productLink: string
  ) {
    const html = this.getBaseTemplate(
      "Ra giá thất bại ❌",
      `<p>Yêu cầu ra giá của bạn cho sản phẩm <strong>${productName}</strong> đã bị từ chối.</p>
       <p><strong>Lý do:</strong> ${reason}</p>
       <p>Vui lòng kiểm tra lại thông tin hoặc liên hệ quản trị viên.</p>`,
      { link: productLink, text: "Xem lại sản phẩm" }
    );
    this.queueEmail(
      email,
      `[Từ chối] Ra giá thất bại cho ${productName}`,
      html
    );
  }

  // ============================================================
  // GROUP 3: AUCTION RESULTS (Kết quả Đấu giá)
  // ============================================================

  /**
   * 1. KẾT THÚC THẤT BẠI (Không có người mua) -> Gửi Seller
   */
  public notifyAuctionEndNoWinner(
    email: string,
    productName: string,
    productLink: string
  ) {
    const html = this.getBaseTemplate(
      "Đấu giá kết thúc (Không có người mua) 😔",
      `<p>Phiên đấu giá sản phẩm <strong>${productName}</strong> đã kết thúc thời gian nhưng không có lượt ra giá nào hợp lệ.</p>
       <p>Bạn có thể gia hạn hoặc đăng lại sản phẩm này bất cứ lúc nào.</p>`,
      { link: productLink, text: "Quản lý sản phẩm" }
    );
    this.queueEmail(
      email,
      `[Kết thúc] Không có người mua ${productName}`,
      html
    );
  }

  /**
   * 2. KẾT THÚC THÀNH CÔNG -> Gửi cả Seller và Winner
   */
  public notifyAuctionEndSuccess(
    sellerEmail: string,
    winnerEmail: string,
    productName: string,
    finalPrice: number,
    winnerName: string,
    productLink: string
  ) {
    const priceStr = finalPrice.toLocaleString("vi-VN") + " đ";

    // A. Gửi người thắng (Winner)
    const winnerHtml = this.getBaseTemplate(
      "CHÚC MỪNG CHIẾN THẮNG! 🏆",
      `<p>Xin chúc mừng! Bạn là người thắng cuộc đấu giá sản phẩm <strong>${productName}</strong>.</p>
       <p>Giá trúng thầu: <strong style="color: #28a745;">${priceStr}</strong></p>
       <p>Vui lòng liên hệ người bán sớm nhất để hoàn tất giao dịch.</p>`,
      { link: productLink, text: "Xem chi tiết giao dịch" }
    );
    this.queueEmail(
      winnerEmail,
      `[Chiến thắng] Bạn đã trúng thầu ${productName}`,
      winnerHtml
    );

    // B. Gửi người bán (Seller)
    const sellerHtml = this.getBaseTemplate(
      "Đấu giá thành công! 🎉",
      `<p>Sản phẩm <strong>${productName}</strong> của bạn đã tìm được chủ nhân mới.</p>
       <p>Người thắng: <strong>${winnerName}</strong> (${winnerEmail})</p>
       <p>Giá chốt: <strong>${priceStr}</strong></p>
       <p>Vui lòng kiểm tra hệ thống để tiến hành giao hàng.</p>`,
      { link: productLink, text: "Xem chi tiết" }
    );
    this.queueEmail(
      sellerEmail,
      `[Thành công] Kết thúc đấu giá ${productName}`,
      sellerHtml
    );
  }

  // ============================================================
  // GROUP 4: INTERACTION (Hỏi & Đáp)
  // ============================================================

  /**
   * 1. NGƯỜI MUA ĐẶT CÂU HỎI -> Gửi Seller
   */
  public notifyNewQuestion(
    email: string,
    productName: string,
    question: string,
    productLink: string
  ) {
    const html = this.getBaseTemplate(
      "Câu hỏi mới từ khách hàng",
      `<p>Sản phẩm <strong>${productName}</strong> vừa nhận được một câu hỏi mới:</p>

       <blockquote style="background: ${COLORS.muted}; border-left: 4px solid ${COLORS.secondaryFg}; margin: 20px 0; padding: 15px; font-style: italic; color: ${COLORS.secondaryFg}; border-radius: 0 4px 4px 0;">
         "${question}"
       </blockquote>

       <p>Trả lời nhanh chóng sẽ giúp tăng độ uy tín và khả năng bán hàng.</p>`,
      { link: productLink, text: "Trả lời ngay" }
    );
    this.queueEmail(email, `[Câu hỏi] Sản phẩm ${productName}`, html);
  }

  /**
   * 2. NGƯỜI BÁN TRẢ LỜI -> Broadcast cho tất cả người liên quan
   * (Kèm nội dung Q&A chi tiết)
   */
  public notifySellerReplied(
    emails: string[],
    productName: string,
    questionContent: string, // Thêm tham số
    answerContent: string, // Thêm tham số
    productLink: string
  ) {
    if (emails.length === 0) return;

    const htmlBody = `
      <p>Người bán vừa phản hồi một thắc mắc về sản phẩm <strong>${productName}</strong> mà bạn đang theo dõi.</p>

      <div style="margin-top: 25px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="background-color: ${COLORS.muted}; color: ${COLORS.mutedFg}; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">Câu hỏi</span>
        </div>
        <div style="background-color: ${COLORS.muted}; color: ${COLORS.secondaryFg}; padding: 15px; border-radius: 8px; font-style: italic; position: relative;">
          "${questionContent}"
        </div>
      </div>

      <div style="margin-top: 15px; margin-left: 20px; border-left: 2px dashed ${COLORS.border}; padding-left: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
           <span style="color: ${COLORS.primary}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Người bán trả lời</span>
        </div>
        <div style="background-color: #f0f7ff; border: 1px solid ${COLORS.primary}40; border-left: 4px solid ${COLORS.primary}; padding: 15px; border-radius: 4px; color: ${COLORS.foreground}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          ${answerContent}
        </div>
      </div>

      <p style="margin-top: 25px; font-size: 14px; color: ${COLORS.mutedFg};">
        Thông tin này có thể ảnh hưởng đến quyết định đấu giá của bạn.
      </p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Cập nhật thảo luận mới 💬",
      htmlBody,
      { link: productLink, text: "Tham gia thảo luận ngay" }
    );

    // Gửi BCC để bảo mật danh sách người nhận
    this.queueEmail(
      emails,
      `[Hỏi-Đáp] Cập nhật mới về ${productName}`,
      fullHtml
    );
  }

  // ============================================================
  // CORE: QUEUE & SENDING LOGIC
  // ============================================================

  async processEmailJob(to: string | string[], subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"Sàn Đấu Giá" <${this.mailerFrom}>`,
        to: Array.isArray(to) ? undefined : to,
        bcc: Array.isArray(to) ? to : undefined,
        subject: subject,
        html: html,
      });

      logger.info(
        `[Email Sent] To: ${Array.isArray(to) ? "Multiple Users" : to} | Subject: ${subject}`
      );
    } catch (error) {
      logger.error(`[Email Failed] To: ${to}`, error);
    }
  }

  private async queueEmail(
    to: string | string[],
    subject: string,
    html: string
  ) {
    await emailQueue.add(
      "send-email",
      { to, subject, html },
      {
        removeOnComplete: true,
        attempts: 3, // Retry 3 lần nếu lỗi
      }
    );
  }

  private getBaseTemplate(
    title: string,
    bodyContent: string,
    cta?: { link: string; text: string }
  ) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Reset cơ bản cho email */
          body { margin: 0; padding: 0; background-color: ${COLORS.muted}; }
          a { text-decoration: none; }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.muted}; padding: 40px 0;">

        <div style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.background}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

          <div style="background-color: ${COLORS.primary}; padding: 30px 20px; text-align: center;">
            <h1 style="color: ${COLORS.primaryFg}; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
              Sàn Đấu Giá - Online Auction
            </h1>
          </div>

          <div style="padding: 40px 30px; color: ${COLORS.foreground};">
            <h2 style="color: ${COLORS.primary}; margin-top: 0; font-size: 20px; font-weight: 600;">
              ${title}
            </h2>

            <div style="line-height: 1.6; font-size: 16px; color: ${COLORS.foreground}; margin-top: 20px;">
              ${bodyContent}
            </div>

            ${
              cta
                ? `
              <div style="margin-top: 35px; text-align: center;">
                <a href="${cta.link}" style="display: inline-block; background-color: ${COLORS.primary}; color: ${COLORS.primaryFg}; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(20, 71, 230, 0.39);">
                  ${cta.text}
                </a>
              </div>
            `
                : ""
            }
          </div>

          <div style="background-color: ${COLORS.muted}; padding: 20px; text-align: center; border-top: 1px solid ${COLORS.border};">
            <p style="margin: 0; font-size: 13px; color: ${COLORS.mutedFg};">
              Email này được gửi tự động từ hệ thống Sàn Đấu Giá.
            </p>
            <p style="margin: 5px 0 0; font-size: 13px; color: ${COLORS.mutedFg};">
              © 2025 Online Auction. Bảo lưu mọi quyền.
            </p>
          </div>
        </div>

      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
