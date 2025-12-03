export const AUTH_PAGE_CONFIG: Record<
  string,
  { title: string; description: string }
> = {
  "/login": {
    title: "Đăng nhập — AuctionHub",
    description: "Đăng nhập để tiếp tục đấu giá",
  },
  "/register": {
    title: "Đăng ký — AuctionHub",
    description: "Tạo tài khoản mới để bắt đầu đấu giá",
  },
  "/forgot-password": {
    title: "Quên mật khẩu?",
    description: "Nhập email để nhận hướng dẫn",
  },
  "/reset-password": {
    title: "Đặt lại mật khẩu",
    description: "Nhập mật khẩu mới cho tài khoản của bạn",
  },
  "/verify": {
    title: "Xác minh tài khoản",
    description: "Nhập mã xác minh đã gửi đến email của bạn",
  },
};
