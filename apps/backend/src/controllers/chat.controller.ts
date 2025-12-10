import type {
  SendMessageRequest,
  ChatMessage,
  UnreadCountResponse,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { chatService } from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get chat history between winner and seller
    const orderId = req.params.id;
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User information not available");
    }
    const userId = req.user.id;
    const history = await chatService.getChatHistory(orderId, userId);
    return ResponseHandler.sendSuccess<ChatMessage[]>(res, history);
  }
);

export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as SendMessageRequest;
    // TODO: Send chat message
    throw new NotImplementedError("Send message not implemented yet");
  }
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Mark message as read
    throw new NotImplementedError("Mark as read not implemented yet");
  }
);

export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get unread message count
    throw new NotImplementedError("Get unread count not implemented yet");
  }
);
