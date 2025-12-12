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

    if (userId !== order.winnerId && userId !== order.sellerId) {
      throw new BadRequestError("User is not a participant in this chat");
    }

    const productId = order.productId;
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.productId, productId),
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

    if (senderId !== order.winnerId && senderId !== order.sellerId) {
      throw new BadRequestError("User is not a participant in this chat");
    }

    const productId = order.productId;
    const receiverId =
      senderId === order.winnerId ? order.sellerId : order.winnerId;

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        productId,
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

    if (userId !== order.winnerId && userId !== order.sellerId) {
      throw new BadRequestError("User is not a participant in this chat");
    }

    const productId = order.productId;
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.productId, productId),
          eq(chatMessages.receiverId, userId),
          inArray(chatMessages.id, messageIds ?? [])
        )
      );

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
