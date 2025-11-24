import { pgEnum } from "drizzle-orm/pg-core";

// Enum cho Vai trò người dùng
export const userRoleEnum = pgEnum("user_role", ["BIDDER", "SELLER", "ADMIN"]);

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
