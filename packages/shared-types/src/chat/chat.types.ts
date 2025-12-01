/**
 * Chat message entity
 */
export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Send message request
 * Backend validation: chat.validation.ts → sendMessageSchema
 */
export interface SendMessageRequest {
  content: string;
}

/**
 * Unread messages count response
 */
export interface UnreadCountResponse {
  count: number;
}
