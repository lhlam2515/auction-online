import type { MessageType } from "../common/enums";

/**
 * Chat message entity - matches backend chatMessages table
 */
export interface ChatMessage {
  id: string;
  productId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  messageType: MessageType;
  createdAt: Date | string;
}

/**
 * Chat message with user information for display
 */
export interface ChatMessageWithUser extends ChatMessage {
  senderName: string;
  senderAvatarUrl?: string;
}

/**
 * Chat conversation summary
 */
export interface ChatConversation {
  productId: string;
  productName: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}
