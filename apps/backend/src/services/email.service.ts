import type { OtpPurpose } from "@repo/shared-types";
import type { MailDataRequired } from "@sendgrid/mail";

import logger from "@/config/logger";
import { emailQueue } from "@/config/queue";
import sendgrid, { SENDGRID_FROM_EMAIL } from "@/config/sendgrid";

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
  private fromEmail: string = SENDGRID_FROM_EMAIL;

  constructor() {
    logger.info(
      `✅ EmailService initialized with SendGrid sender: ${this.fromEmail}`
    );
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

  /**
   * 3. MUA NGAY THÀNH CÔNG -> Gửi cho Người bán (Seller)
   */
  public notifyProductSold(
    sellerEmail: string,
    productName: string,
    price: number,
    buyerName: string,
    productLink: string
  ) {
    const priceStr = price.toLocaleString("vi-VN") + " đ";
    const html = this.getBaseTemplate(
      "Sản phẩm đã được mua ngay! 🎉",
      `<p>Tin vui! Sản phẩm <strong>${productName}</strong> của bạn đã được mua ngay bởi khách hàng <strong>${buyerName}</strong>.</p>

       <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; color: white;">
         <p style="margin: 0; font-size: 16px; opacity: 0.9;">Giá bán thành công</p>
         <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
           ${priceStr}
         </p>
       </div>

       <p style="font-size: 15px; color: ${COLORS.foreground}; line-height: 1.8;">
         <strong>Bước tiếp theo:</strong><br/>
         • Kiểm tra thông tin đơn hàng trong hệ thống<br/>
         • Chuẩn bị sản phẩm và đóng gói cẩn thận<br/>
         • Chờ người mua thanh toán để tiến hành giao hàng
       </p>`,
      { link: productLink, text: "Xem chi tiết đơn hàng" }
    );
    this.queueEmail(
      sellerEmail,
      `[Mua Ngay] ${productName} đã được bán thành công`,
      html
    );
  }

  /**
   * 4. MUA NGAY THÀNH CÔNG -> Gửi cho Người mua (Buyer)
   */
  public notifyBuyNowSuccess(
    buyerEmail: string,
    productName: string,
    price: number,
    productLink: string
  ) {
    const priceStr = price.toLocaleString("vi-VN") + " đ";
    const html = this.getBaseTemplate(
      "Mua ngay thành công! 🎊",
      `<p>Chúc mừng! Bạn đã mua thành công sản phẩm <strong>${productName}</strong>.</p>

       <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 25px 0;">
         <p style="margin: 0; color: #166534; font-size: 15px;">
           <strong>✓ Giao dịch đã được xác nhận</strong>
         </p>
         <p style="margin: 10px 0 0 0; color: #166534; font-size: 18px; font-weight: 600;">
           Tổng thanh toán: <span style="font-size: 22px;">${priceStr}</span>
         </p>
       </div>

       <p style="font-size: 15px; color: ${COLORS.foreground}; line-height: 1.8;">
         <strong>Các bước tiếp theo:</strong><br/>
         1️⃣ Cập nhật địa chỉ giao hàng (nếu chưa có)<br/>
         2️⃣ Thanh toán đơn hàng để người bán chuẩn bị giao hàng<br/>
         3️⃣ Theo dõi trạng thái đơn hàng trong hệ thống
       </p>

       <p style="background: ${COLORS.muted}; padding: 15px; border-radius: 6px; font-size: 14px; color: ${COLORS.mutedFg};">
         💡 <strong>Lưu ý:</strong> Vui lòng thanh toán trong vòng 24 giờ để tránh đơn hàng bị hủy.
       </p>`,
      { link: productLink, text: "Quản lý đơn hàng" }
    );
    this.queueEmail(buyerEmail, `[Thành công] Bạn đã mua ${productName}`, html);
  }

  /**
   * 5. MUA NGAY THÀNH CÔNG -> Thông báo cho các Bidder khác (Đã thua)
   */
  public notifyBuyNowOthers(
    bidderEmails: string[],
    productName: string,
    buyNowPrice: number,
    productLink: string
  ) {
    if (bidderEmails.length === 0) return;

    const priceStr = buyNowPrice.toLocaleString("vi-VN") + " đ";
    const html = this.getBaseTemplate(
      "Sản phẩm đã được mua ngay 📢",
      `<p>Rất tiếc, sản phẩm <strong>${productName}</strong> mà bạn đang tham gia đấu giá đã được một người mua khác mua ngay.</p>

       <div style="background-color: #fef2f2; border-left: 4px solid ${COLORS.destructive}; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
         <p style="margin: 0; color: ${COLORS.destructive}; font-weight: 600;">
           ⚠️ Phiên đấu giá đã kết thúc sớm
         </p>
         <p style="margin: 8px 0 0 0; color: #991b1b;">
           Giá mua ngay: <strong>${priceStr}</strong>
         </p>
       </div>

       <p>Các lượt ra giá trước đó của bạn đã được hủy và không phát sinh chi phí nào.</p>

       <p style="font-size: 14px; color: ${COLORS.mutedFg}; font-style: italic;">
         💡 Đừng lo lắng! Còn rất nhiều sản phẩm tương tự đang chờ bạn khám phá.
       </p>`,
      { link: productLink, text: "Khám phá sản phẩm khác" }
    );

    this.queueEmail(
      bidderEmails,
      `[Thông báo] ${productName} đã được mua ngay`,
      html
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
  // GROUP 5: PRODUCT UPDATES (Cập nhật Sản phẩm)
  // ============================================================

  /**
   * Thông báo cho người dùng khi mô tả sản phẩm được cập nhật
   * Gửi cho: Bidders và Watchers (không gửi cho chính seller)
   */
  public notifyProductDescriptionUpdate(
    emails: string[],
    productName: string,
    descriptionUpdate: string,
    productLink: string
  ) {
    if (emails.length === 0) return;

    const descriptionPreview =
      descriptionUpdate.length > 300
        ? descriptionUpdate.substring(0, 300) + "..."
        : descriptionUpdate;

    const htmlBody = `
      <p>Sản phẩm <strong>${productName}</strong> mà bạn đang theo dõi vừa có cập nhật mô tả mới từ người bán.</p>

      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; color: white;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">
          📝 Thông tin mới đã được thêm vào
        </p>
      </div>

      <div style="background: #f8fafc; border-left: 4px solid ${COLORS.primary}; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: ${COLORS.primary}; text-transform: uppercase; letter-spacing: 0.5px;">Nội dung cập nhật mới</p>
        <div style="color: ${COLORS.foreground}; font-size: 15px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word;">${descriptionPreview}</div>
        ${descriptionUpdate.length > 300 ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: ${COLORS.mutedFg}; font-style: italic;">... Xem toàn bộ nội dung trên trang sản phẩm</p>` : ""}
      </div>

      <p style="font-size: 15px; color: ${COLORS.foreground}; line-height: 1.8;">
        <strong>Tại sao điều này quan trọng?</strong><br/>
        • Người bán đã cung cấp thêm chi tiết về sản phẩm<br/>
        • Thông tin mới có thể ảnh hưởng đến quyết định đấu giá của bạn<br/>
        • Giúp bạn hiểu rõ hơn về sản phẩm trước khi ra giá
      </p>

      <p style="background: ${COLORS.muted}; padding: 15px; border-radius: 6px; font-size: 14px; color: ${COLORS.mutedFg};">
        💡 <strong>Gợi ý:</strong> Xem toàn bộ chi tiết trên trang sản phẩm để đảm bảo sản phẩm vẫn phù hợp với nhu cầu của bạn.
      </p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Cập nhật mô tả sản phẩm 📋",
      htmlBody,
      { link: productLink, text: "Xem chi tiết đầy đủ" }
    );

    // Gửi BCC để bảo mật danh sách người nhận
    this.queueEmail(
      emails,
      `[Cập nhật] Mô tả mới cho ${productName}`,
      fullHtml
    );
  }

  // ============================================================
  // GROUP 6: ADMIN USER MANAGEMENT (Quản lý User bởi Admin)
  // ============================================================

  /**
   * Thông báo cho user khi bị ban bởi admin
   */
  public notifyUserBanned(
    userEmail: string,
    userName: string,
    reason: string,
    duration?: number
  ) {
    const durationText = duration ? ` trong ${duration} ngày` : " vô thời hạn";

    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: ${COLORS.muted}; border-left: 4px solid ${COLORS.destructive}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${COLORS.destructive}; font-size: 18px;">
          ⚠️ Tài khoản của bạn đã bị tạm ngừng
        </h3>
        <p style="margin: 0; color: ${COLORS.foreground};">
          <strong>Lý do:</strong> ${reason}
        </p>
        <p style="margin: 10px 0 0 0; color: ${COLORS.foreground};">
          <strong>Thời gian:</strong> ${durationText}
        </p>
      </div>

      <p><strong>Các thay đổi đã được thực hiện:</strong></p>
      <ul>
        <li>Tất cả bids hiện tại của bạn đã được đánh dấu là không hợp lệ</li>
        <li>Các cấu hình auto-bid đã bị vô hiệu hóa</li>
        <li>Bạn không thể tham gia đấu giá mới</li>
      </ul>

      <p style="color: ${COLORS.mutedFg}; font-style: italic;">
        Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với bộ phận hỗ trợ để được xem xét lại.
      </p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Thông báo tạm ngừng tài khoản",
      htmlBody
    );
    this.queueEmail(userEmail, "Tài khoản đã bị tạm ngừng", fullHtml);
  }

  /**
   * Thông báo cho user khi được unban bởi admin
   */
  public notifyUserUnbanned(userEmail: string, userName: string) {
    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: #f0f9ff; border-left: 4px solid ${COLORS.primary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${COLORS.primary}; font-size: 18px;">
          ✅ Tài khoản của bạn đã được kích hoạt lại
        </h3>
        <p style="margin: 0; color: ${COLORS.foreground};">
          Tài khoản của bạn đã được khôi phục và có thể sử dụng bình thường.
        </p>
      </div>

      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Các cấu hình auto-bid vẫn bị vô hiệu hóa để đảm bảo an toàn</li>
        <li>Bạn có thể kích hoạt lại auto-bid theo nhu cầu</li>
        <li>Các bids đã bị invalidate sẽ không được tự động khôi phục</li>
      </ul>

      <p>Chúc bạn tiếp tục có những trải nghiệm tốt trên sàn đấu giá của chúng tôi!</p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Tài khoản đã được kích hoạt lại",
      htmlBody
    );
    this.queueEmail(userEmail, "Tài khoản đã được kích hoạt lại", fullHtml);
  }

  /**
   * Thông báo cho user khi password được reset bởi admin
   */
  public notifyUserPasswordReset(
    userEmail: string,
    userName: string,
    newPassword: string
  ) {
    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: ${COLORS.secondary}; border: 1px dashed ${COLORS.primary}; padding: 25px; text-align: center; margin: 30px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: ${COLORS.primary};">
          🔐 Mật khẩu đã được đặt lại
        </h3>
        <p style="margin: 0 0 10px 0; font-size: 16px; color: ${COLORS.foreground};">
          Mật khẩu mới của bạn là:
        </p>
        <span style="font-size: 24px; font-weight: 700; letter-spacing: 2px; color: ${COLORS.primary}; display: block; background: ${COLORS.muted}; padding: 15px; border-radius: 4px;">
          ${newPassword}
        </span>
      </div>

      <div style="background: ${COLORS.muted}; border-left: 4px solid ${COLORS.destructive}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: ${COLORS.foreground}; font-weight: 600;">
          ⚠️ Quan trọng: Vui lòng đổi mật khẩu ngay sau khi đăng nhập
        </p>
      </div>

      <p style="color: ${COLORS.mutedFg}; font-style: italic;">
        Email này được gửi từ hệ thống quản trị. Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ hỗ trợ ngay lập tức.
      </p>
    `;

    const fullHtml = this.getBaseTemplate("Mật khẩu đã được đặt lại", htmlBody);
    this.queueEmail(userEmail, "Mật khẩu tài khoản đã được đặt lại", fullHtml);
  }

  /**
   * Thông báo cho user khi tài khoản bị xóa bởi admin
   */
  public notifyUserDeleted(
    userEmail: string,
    userName: string,
    reason: string
  ) {
    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: ${COLORS.muted}; border-left: 4px solid ${COLORS.destructive}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${COLORS.destructive}; font-size: 18px;">
          ❌ Tài khoản của bạn đã bị xóa
        </h3>
        <p style="margin: 0; color: ${COLORS.foreground};">
          <strong>Lý do:</strong> ${reason}
        </p>
      </div>

      <p><strong>Thông tin về việc xóa tài khoản:</strong></p>
      <ul>
        <li>Tất cả dữ liệu cá nhân đã được xóa khỏi hệ thống</li>
        <li>Các đơn hàng và giao dịch đã hoàn tất sẽ được lưu trữ cho mục đích thống kê</li>
        <li>Bạn không thể đăng nhập lại với tài khoản này</li>
      </ul>

      <p style="color: ${COLORS.mutedFg}; font-style: italic;">
        Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với bộ phận hỗ trợ trong vòng 30 ngày để được xem xét.
      </p>

      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi trong thời gian qua.</p>
    `;

    const fullHtml = this.getBaseTemplate("Thông báo xóa tài khoản", htmlBody);
    this.queueEmail(userEmail, "Tài khoản đã bị xóa", fullHtml);
  }

  /**
   * Thông báo cho user khi role được thay đổi bởi admin
   */
  public notifyUserRoleChanged(
    userEmail: string,
    userName: string,
    oldRole: string,
    newRole: string
  ) {
    const roleNames: Record<string, string> = {
      BIDDER: "Người mua",
      SELLER: "Người bán",
      ADMIN: "Quản trị viên",
    };

    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: #f0f9ff; border-left: 4px solid ${COLORS.primary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${COLORS.primary}; font-size: 18px;">
          🔄 Quyền hạn tài khoản đã được thay đổi
        </h3>
        <p style="margin: 0; color: ${COLORS.foreground};">
          <strong>Thay đổi:</strong> ${roleNames[oldRole] || oldRole} → ${roleNames[newRole] || newRole}
        </p>
      </div>

      <p><strong>Quyền hạn mới của bạn:</strong></p>
      <ul>
        ${
          newRole === "SELLER"
            ? `
          <li>Đăng sản phẩm đấu giá</li>
          <li>Quản lý sản phẩm của mình</li>
          <li>Trả lời câu hỏi từ người mua</li>
          <li>Nhận thông báo về bids mới</li>
        `
            : newRole === "ADMIN"
              ? `
          <li>Quản lý toàn bộ hệ thống</li>
          <li>Quản lý người dùng</li>
          <li>Duyệt sản phẩm</li>
          <li>Thống kê và báo cáo</li>
        `
              : `
          <li>Đặt giá sản phẩm</li>
          <li>Theo dõi sản phẩm yêu thích</li>
          <li>Đặt câu hỏi cho người bán</li>
          <li>Đánh giá sản phẩm sau khi mua</li>
        `
        }
      </ul>

      <p>Chúc bạn có những trải nghiệm tốt với quyền hạn mới!</p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Quyền hạn tài khoản đã được cập nhật",
      htmlBody
    );
    this.queueEmail(
      userEmail,
      "Quyền hạn tài khoản đã được thay đổi",
      fullHtml
    );
  }

  /**
   * Thông báo cho user khi tài khoản được tạo bởi admin
   */
  public notifyUserCreated(
    userEmail: string,
    userName: string,
    password: string,
    role: string
  ) {
    const roleNames: Record<string, string> = {
      BIDDER: "Người mua",
      SELLER: "Người bán",
      ADMIN: "Quản trị viên",
    };

    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #22c55e; font-size: 18px;">
          🎉 Tài khoản của bạn đã được tạo thành công
        </h3>
        <p style="margin: 0; color: ${COLORS.foreground};">
          Chào mừng bạn gia nhập cộng đồng đấu giá của chúng tôi!
        </p>
      </div>

      <div style="background: ${COLORS.secondary}; border: 1px dashed ${COLORS.primary}; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: ${COLORS.primary};">
          Thông tin đăng nhập:
        </h4>
        <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${userEmail}</p>
        <p style="margin: 0 0 5px 0;"><strong>Mật khẩu:</strong> ${password}</p>
        <p style="margin: 0 0 5px 0;"><strong>Vai trò:</strong> ${roleNames[role] || role}</p>
      </div>

      <div style="background: ${COLORS.muted}; border-left: 4px solid ${COLORS.destructive}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: ${COLORS.foreground}; font-weight: 600;">
          ⚠️ Quan trọng: Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu
        </p>
      </div>

      <p>Chúc bạn có những trải nghiệm thú vị trên sàn đấu giá!</p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Chào mừng bạn đến với sàn đấu giá",
      htmlBody
    );
    this.queueEmail(userEmail, "Tài khoản đã được tạo thành công", fullHtml);
  }

  /**
   * Thông báo cho user khi admin thay đổi thông tin cá nhân
   */
  public notifyUserInfoUpdated(
    userEmail: string,
    userName: string,
    changedFields: Array<{ field: string; oldValue: string; newValue: string }>
  ) {
    const fieldsHtml = changedFields
      .map(
        ({ field, oldValue, newValue }) => `
        <div style="margin-bottom: 15px; padding: 10px; background: ${COLORS.muted}; border-radius: 4px;">
          <strong>${field}:</strong><br>
          <span style="color: ${COLORS.destructive}; text-decoration: line-through;">${oldValue}</span> →
          <span style="color: ${COLORS.primary}; font-weight: bold;">${newValue}</span>
        </div>`
      )
      .join("");

    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: ${COLORS.secondary}; border-left: 4px solid ${COLORS.primary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${COLORS.primary}; font-size: 18px;">
          ℹ️ Thông tin tài khoản đã được cập nhật
        </h3>
        <p style="margin: 0 0 15px 0; color: ${COLORS.foreground};">
          Các thay đổi chi tiết:
        </p>
        ${fieldsHtml}
      </div>

      <p>Những thay đổi này được thực hiện bởi quản trị viên hệ thống để đảm bảo tính chính xác và tuân thủ các quy định.</p>

      <p style="color: ${COLORS.mutedFg}; font-style: italic;">
        Nếu bạn có thắc mắc về những thay đổi này, vui lòng liên hệ với bộ phận hỗ trợ.
      </p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Thông báo cập nhật thông tin tài khoản",
      htmlBody
    );
    this.queueEmail(
      userEmail,
      "Thông tin tài khoản đã được cập nhật",
      fullHtml
    );
  }

  /**
   * Thông báo cho user khi admin thay đổi trạng thái tài khoản
   */
  public notifyAccountStatusChanged(
    userEmail: string,
    userName: string,
    oldStatus: string,
    newStatus: string,
    reason?: string
  ) {
    const statusMap = {
      PENDING_VERIFICATION: "Chờ xác thực",
      ACTIVE: "Hoạt động",
      BANNED: "Bị cấm",
    };

    const oldStatusText =
      statusMap[oldStatus as keyof typeof statusMap] || oldStatus;
    const newStatusText =
      statusMap[newStatus as keyof typeof statusMap] || newStatus;

    const htmlBody = `
      <p>Xin chào <strong>${userName}</strong>,</p>

      <div style="background: ${COLORS.secondary}; border-left: 4px solid ${COLORS.primary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${COLORS.primary}; font-size: 18px;">
          ℹ️ Trạng thái tài khoản đã được thay đổi
        </h3>
        <p style="margin: 0; color: ${COLORS.foreground};">
          <strong>Trạng thái cũ:</strong> ${oldStatusText}
        </p>
        <p style="margin: 10px 0 0 0; color: ${COLORS.foreground};">
          <strong>Trạng thái mới:</strong> ${newStatusText}
        </p>
        ${reason ? `<p style="margin: 10px 0 0 0; color: ${COLORS.foreground};"><strong>Lý do:</strong> ${reason}</p>` : ""}
      </div>

      <p>Thay đổi này được thực hiện bởi quản trị viên hệ thống.</p>

      <p style="color: ${COLORS.mutedFg}; font-style: italic;">
        Nếu bạn có thắc mắc, vui lòng liên hệ với bộ phận hỗ trợ.
      </p>
    `;

    const fullHtml = this.getBaseTemplate(
      "Thông báo thay đổi trạng thái tài khoản",
      htmlBody
    );
    this.queueEmail(
      userEmail,
      "Trạng thái tài khoản đã được thay đổi",
      fullHtml
    );
  }

  // ============================================================
  // CORE: QUEUE & SENDING LOGIC
  // ============================================================

  async processEmailJob(to: string | string[], subject: string, html: string) {
    try {
      const msg: MailDataRequired = {
        to: Array.isArray(to) ? to : [to],
        from: {
          email: this.fromEmail,
          name: "Sàn Đấu Giá",
        },
        subject: subject,
        html: html,
      };

      await sendgrid.send(msg);

      logger.info(
        `[Email Sent via SendGrid] To: ${Array.isArray(to) ? `${to.length} recipients` : to} | Subject: ${subject}`
      );
    } catch (error) {
      logger.error(`[SendGrid Email Failed] To: ${to}`, error);
      throw error;
    }
  }

  private async queueEmail(
    to: string | string[],
    subject: string,
    html: string
  ) {
    try {
      await emailQueue.add(
        "send-email",
        { to, subject, html },
        {
          removeOnComplete: true,
          attempts: 3, // Retry 3 times if failed
        }
      );
    } catch (error) {
      logger.error("[Email Queue Failed]", error);
    }
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
