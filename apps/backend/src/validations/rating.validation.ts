import { z } from "zod";

export const userIdSchema = z.object({
  userId: z.uuid({ error: "Invalid user ID" }),
});

export const orderIdSchema = z.object({
  orderId: z.uuid({ error: "Invalid order ID" }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createRatingSchema = z.object({
  productId: z.uuid({ error: "Invalid product ID" }),
  receiverId: z.uuid({ error: "Invalid receiver ID" }),
  score: z
    .number()
    .int()
    .refine((val) => val === 1 || val === -1, {
      error: "Score must be 1 or -1",
    }),
  comment: z.string().optional(),
});
