// Re-export bid status from common enums
export type { BidStatus } from "../common/enums";

/**
 * Auto bid status - extended for auto bid functionality
 */
export type AutoBidStatus = "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";
