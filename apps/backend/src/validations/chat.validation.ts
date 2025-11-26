import { z } from "zod";

export const orderIdSchema = z.object({
  id: z.uuid({ error: "Invalid order ID" }),
});

export const messageIdSchema = z.object({
  id: z.uuid({ error: "Invalid message ID" }),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, { error: "Message content is required" })
    .max(1000),
});
