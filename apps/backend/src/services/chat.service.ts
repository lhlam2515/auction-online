import type {
  ChatMessage,
  UnreadCountResponse,
  ChatMessageType,
} from "@repo/shared-types";
import { eq, and, desc, inArray } from "drizzle-orm";

import { db } from "@/config/database";
import { chatMessages, orders } from "@/models";
import { BadRequestError, NotFoundError } from "@/utils/errors";

export class ChatService {
  async getChatHistory(orderId: string, userId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Handle nullable fields - cannot access chat if users deleted
    if (!order.winnerId || !order.sellerId) {
      throw new BadRequestError(
        "Cannot access chat - buyer or seller information is missing"
      );
    }

    if (userId !== order.winnerId && userId !== order.sellerId) {
      throw new BadRequestError("User is not a participant in this chat");
    }

    // Handle nullable productId
    if (!order.productId) {
      throw new BadRequestError(
        "Cannot access chat - product information is missing"
      );
    }

    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.productId, order.productId),
      orderBy: [desc(chatMessages.createdAt)],
    });

    return messages as ChatMessage[];
  }

  async sendMessage(
    orderId: string,
    senderId: string,
    content: string,
    messageType: ChatMessageType = "TEXT"
  ) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Handle nullable fields - cannot send message if users deleted
    if (!order.winnerId || !order.sellerId) {
      throw new BadRequestError(
        "Cannot send message - buyer or seller information is missing"
      );
    }

    if (senderId !== order.winnerId && senderId !== order.sellerId) {
      throw new BadRequestError("User is not a participant in this chat");
    }

    // Handle nullable productId
    if (!order.productId) {
      throw new BadRequestError(
        "Cannot send message - product information is missing"
      );
    }

    const receiverId =
      senderId === order.winnerId ? order.sellerId : order.winnerId;

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        productId: order.productId,
        senderId,
        receiverId,
        content,
        messageType,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();

    return newMessage as ChatMessage;
  }

  async markMessagesAsRead(
    orderId: string,
    userId: string,
    messageIds?: string[]
  ) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Handle nullable fields - cannot mark messages if users deleted
    if (!order.winnerId || !order.sellerId) {
      throw new BadRequestError(
        "Cannot mark messages - buyer or seller information is missing"
      );
    }

    if (userId !== order.winnerId && userId !== order.sellerId) {
      throw new BadRequestError("User is not a participant in this chat");
    }

    // Handle nullable productId
    if (!order.productId) {
      throw new BadRequestError(
        "Cannot mark messages - product information is missing"
      );
    }

    // If messageIds is provided, mark specific messages as read
    if (messageIds && messageIds.length > 0) {
      await db
        .update(chatMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(chatMessages.productId, order.productId),
            eq(chatMessages.receiverId, userId),
            inArray(chatMessages.id, messageIds)
          )
        );
    } else {
      // Otherwise mark ALL unread messages in this chat as read
      await db
        .update(chatMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(chatMessages.productId, order.productId),
            eq(chatMessages.receiverId, userId),
            eq(chatMessages.isRead, false)
          )
        );
    }

    return { message: "Messages marked as read successfully" };
  }

  async getUnreadCount(userId: string) {
    const messages = await db.query.chatMessages.findMany({
      where: and(
        eq(chatMessages.receiverId, userId),
        eq(chatMessages.isRead, false)
      ),
    });

    return { count: messages.length } as UnreadCountResponse;
  }
}

export const chatService = new ChatService();
