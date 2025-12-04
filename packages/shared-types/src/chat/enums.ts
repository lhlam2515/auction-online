// Re-export message type from common enums
export type { MessageType as ChatMessageType } from "../common/enums";

/**
 * Message status for read receipts
 */
export type MessageStatus = "SENT" | "DELIVERED" | "READ";
