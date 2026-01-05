import { pgEnum } from "drizzle-orm/pg-core";

// Enum cho Vai trò người dùng
export const userRoleEnum = pgEnum("user_role", ["BIDDER", "SELLER", "ADMIN"]);

// Enum cho Trạng thái tài khoản
export const accountStatusEnum = pgEnum("account_status", [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "BANNED",
]);

// Enum cho Trạng thái Sản phẩm
export const productStatusEnum = pgEnum("product_status", [
  "PENDING",
  "ACTIVE",
  "SOLD",
  "NO_SALE",
  "CANCELLED",
  "SUSPENDED",
]);

// Enum cho Trạng thái Yêu cầu nâng cấp
export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// Enum cho Trạng thái Bid
export const bidStatusEnum = pgEnum("bid_status", ["VALID", "INVALID"]);

// Enum cho Trạng thái Order
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
]);

// Enum cho Phương thức Thanh toán
export const paymentMethodEnum = pgEnum("payment_method", [
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "EWALLET",
]);

// Enum cho Trạng thái Thanh toán
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
]);

// Enum cho Nhà vận chuyển
export const shippingProviderEnum = pgEnum("shipping_provider", [
  "VNPOST",
  "GHN",
  "GHTK",
  "JNT",
]);

// Enum cho Mục đích OTP
export const otpPurposeEnum = pgEnum("otp_purpose", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);
