import type { ChatMessageType } from "./enums";

/**
 * Send message request
 * Backend validation: chat.validation.ts → sendMessageSchema
 */
export interface SendMessageRequest {
  content: string;
  messageType?: ChatMessageType;
}

/**
 * Mark messages as read request
 */
export interface MarkMessagesReadRequest {
  messageIds: string[];
}
