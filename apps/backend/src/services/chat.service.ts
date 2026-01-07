import type {
  ChatMessage,
  UnreadCountResponse,
  ChatMessageType,
} from "@repo/shared-types";
import { eq, and, desc, inArray, count } from "drizzle-orm";

import { db } from "@/config/database";
import { chatMessages, orders } from "@/models";
import { BadRequestError, NotFoundError } from "@/utils/errors";

export class ChatService {
  async getChatHistory(
    orderId: string,
    userId: string
  ): Promise<ChatMessage[]> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { id: true, winnerId: true, sellerId: true },
    });

    if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (userId !== order.winnerId && userId !== order.sellerId) {
      throw new BadRequestError(
        "Người dùng không tham gia trong cuộc trò chuyện này"
      );
    }

    const messages = await db.query.chatMessages
      .findMany({
        where: eq(chatMessages.orderId, order.id),
        orderBy: desc(chatMessages.createdAt),
      })
      .then((msgs) =>
        msgs.map((msg) => ({
          ...msg,
          messageType: msg.messageType as ChatMessageType,
          createdAt: msg.createdAt.toISOString(),
        }))
      );

    return messages;
  }

  async sendMessage(
    orderId: string,
    senderId: string,
    content: string,
    messageType: ChatMessageType = "TEXT"
  ): Promise<ChatMessage> {
    return await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: { winnerId: true, sellerId: true },
      });

      if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");

      if (!order.winnerId || !order.sellerId) {
        throw new BadRequestError(
          "Không thể gửi tin nhắn - thông tin người tham gia bị thiếu"
        );
      }

      if (senderId !== order.winnerId && senderId !== order.sellerId) {
        throw new BadRequestError(
          "Người dùng không tham gia trong cuộc trò chuyện này"
        );
      }

      const receiverId =
        senderId === order.winnerId ? order.sellerId : order.winnerId;

      const [newMessage] = await tx
        .insert(chatMessages)
        .values({
          orderId,
          senderId,
          receiverId,
          content,
          messageType,
          isRead: false,
          createdAt: new Date(),
        })
        .returning()
        .then(([msg]) => [
          {
            ...msg,
            messageType: msg.messageType as ChatMessageType,
            createdAt: msg.createdAt.toISOString(),
          },
        ]);

      return newMessage;
    });
  }

  async markMessagesAsRead(
    orderId: string,
    userId: string,
    messageIds?: string[]
  ): Promise<{ message: string }> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { winnerId: true, sellerId: true },
    });

    if (!order) throw new NotFoundError("Không tìm thấy đơn hàng");

    if (!order.winnerId || !order.sellerId) {
      throw new BadRequestError(
        "Không thể đánh dấu tin nhắn đã đọc - thông tin người tham gia bị thiếu"
      );
    }

    if (userId !== order.winnerId && userId !== order.sellerId) {
      throw new BadRequestError(
        "Người dùng không tham gia trong cuộc trò chuyện này"
      );
    }

    const conditions = [
      eq(chatMessages.orderId, orderId),
      eq(chatMessages.receiverId, userId),
      eq(chatMessages.isRead, false), // Chỉ update cái chưa đọc
    ];

    if (messageIds && messageIds.length > 0) {
      conditions.push(inArray(chatMessages.id, messageIds));
    }

    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(and(...conditions));

    return { message: "Tin nhắn đã được đánh dấu là đã đọc" };
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    const [result] = await db
      .select({ value: count() })
      .from(chatMessages)
      .where(
        and(eq(chatMessages.receiverId, userId), eq(chatMessages.isRead, false))
      );

    return { count: Number(result.value) };
  }
}

export const chatService = new ChatService();
