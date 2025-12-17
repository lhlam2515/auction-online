import { z } from "zod";

export const productIdSchema = z.object({
  id: z.uuid({ error: "Invalid product ID" }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const placeBidSchema = z.object({
  amount: z.coerce.number().positive({ error: "Bid amount must be positive" }),
});

export const kickBidderSchema = z.object({
  bidderId: z.uuid({ error: "Invalid user ID" }),
  reason: z.string().min(10, { error: "Please provide a reason" }),
});

export const autoBidSchema = z.object({
  maxAmount: z.coerce
    .number()
    .positive({ error: "Max amount must be positive" }),
});

export const autoBidIdSchema = z.object({
  id: z.uuid({ error: "Invalid auto-bid ID" }),
});

export const updateAutoBidSchema = z.object({
  maxAmount: z.coerce
    .number()
    .positive({ error: "Max amount must be positive" }),
});
