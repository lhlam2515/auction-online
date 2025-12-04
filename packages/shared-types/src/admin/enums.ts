// Re-export request status from common enums
export type { RequestStatus as UpgradeRequestStatus } from "../common/enums";

/**
 * Admin action types for audit logs
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
 * Report status for content moderation
 */
export type ReportStatus =
  | "PENDING"
  | "INVESTIGATING"
  | "RESOLVED"
  | "DISMISSED";
