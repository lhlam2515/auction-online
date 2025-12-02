import type { ChatMessageType, MessageStatus } from "./enums";

/**
 * Chat message entity
 */
export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: ChatMessageType;
  status: MessageStatus;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat conversation info
 */
export interface ChatConversation {
  orderId: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
