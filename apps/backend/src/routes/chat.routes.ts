import { Router } from "express";

import * as chatController from "@/controllers/chat.controller";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as chatValidation from "@/validations/chat.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/orders/:id/chat
 * @desc    Get chat history between winner and seller
 * @access  Private (winner or seller)
 */
router.get(
  "/:id/chat",
  validate({ params: chatValidation.orderIdSchema }),
  chatController.getChatHistory
);

/**
 * @route   POST /api/orders/:id/chat
 * @desc    Send chat message
 * @access  Private (winner or seller)
 */
router.post(
  "/:id/chat",
  validate({
    params: chatValidation.orderIdSchema,
    body: chatValidation.sendMessageSchema,
  }),
  chatController.sendMessage
);

/**
 * @route   PUT /api/orders/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put(
  "/messages/:id/read",
  validate({ params: chatValidation.messageIdSchema }),
  chatController.markAsRead
);

/**
 * @route   GET /api/orders/messages/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get("/messages/unread-count", chatController.getUnreadCount);
export default router;
