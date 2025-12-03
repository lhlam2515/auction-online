import type {
  SendMessageRequest,
  MarkMessagesReadRequest,
  ChatMessage,
  ChatConversation,
  ChatRoomResponse,
  UnreadCountResponse,
  ChatMessageType,
  MessageStatus,
} from "@repo/shared-types";
import { eq, and } from "drizzle-orm";

import { db } from "@/config/database";
import { chatMessages } from "@/models";
import {
  BadRequestError,
  NotFoundError,
  NotImplementedError,
} from "@/utils/errors";

export class ChatService {
  async getChatHistory(
    orderId: string,
    userId: string
  ): Promise<ChatMessage[]> {
    // TODO: implement chat history retrieval
    // Should fetch messages for the order and verify user is participant
    throw new NotImplementedError("Chat history retrieval not implemented");
  }

  async sendMessage(
    orderId: string,
    senderId: string,
    content: string,
    messageType: ChatMessageType = "TEXT"
  ): Promise<ChatMessage> {
    // TODO: implement message sending
    // Should create new message in chat and return the created message
    // Verify sender is participant in the order chat
    throw new NotImplementedError("Send message not implemented");
  }

  async markMessagesAsRead(
    orderId: string,
    userId: string,
    messageIds?: string[]
  ): Promise<boolean> {
    // TODO: implement mark messages as read
    // Should mark specified messages or all unread messages as read for the user
    throw new NotImplementedError("Mark as read not implemented");
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    // TODO: implement unread count retrieval
    // Should return count of unread messages across all user's chats
    throw new NotImplementedError("Get unread count not implemented");
  }

  async createOrGetChatRoom(
    orderId: string,
    participantIds: string[]
  ): Promise<ChatRoomResponse> {
    // TODO: implement chat room creation or retrieval
    // Should create new chat room for order if doesn't exist, or return existing one
    throw new NotImplementedError("Create or get chat room not implemented");
  }

  async getChatConversation(
    orderId: string,
    userId: string
  ): Promise<ChatConversation> {
    // TODO: implement get chat conversation with authorization check
    // Should verify user is participant before returning conversation details
    throw new NotImplementedError("Get chat conversation not implemented");
  }

  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    // TODO: implement get all conversations for user
    // Should return list of chat conversations where user is participant
    throw new NotImplementedError("Get user conversations not implemented");
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    // TODO: implement message deletion
    // Should allow deletion by message sender only
    throw new NotImplementedError("Delete message not implemented");
  }
}

export const chatService = new ChatService();
