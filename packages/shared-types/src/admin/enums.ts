/**
 * Upgrade request status
 */
export type UpgradeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Admin action types
 */
export type AdminActionType =
  | "BAN_USER"
  | "UNBAN_USER"
  | "APPROVE_PRODUCT"
  | "REJECT_PRODUCT"
  | "SUSPEND_PRODUCT"
  | "APPROVE_UPGRADE"
  | "REJECT_UPGRADE";

/**
 * Report status
 */
export type ReportStatus =
  | "PENDING"
  | "INVESTIGATING"
  | "RESOLVED"
  | "DISMISSED";
