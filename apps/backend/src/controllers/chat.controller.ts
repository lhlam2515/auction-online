import type {
  SendMessageRequest,
  ChatMessage,
  UnreadCountResponse,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { chatService } from "@/services";
import { ResponseHandler } from "@/utils/response";

export const getChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const orderId = req.params.id;

    const history = await chatService.getChatHistory(orderId, userId);
    return ResponseHandler.sendSuccess<ChatMessage[]>(res, history);
  }
);

export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: senderId } = req.user!;
    const { content, messageType } = req.body as SendMessageRequest;
    const orderId = req.params.id;

    const message = await chatService.sendMessage(
      orderId,
      senderId,
      content,
      messageType
    );
    return ResponseHandler.sendSuccess<ChatMessage>(res, message);
  }
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const messageId = req.params.id;

    const result = await chatService.markMessagesAsRead(messageId, userId);
    return ResponseHandler.sendSuccess<boolean>(res, result);
  }
);

export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const count = await chatService.getUnreadCount(userId);
    return ResponseHandler.sendSuccess<UnreadCountResponse>(res, count);
  }
);
