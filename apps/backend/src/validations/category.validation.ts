import { z } from "zod";

export const categoryIdSchema = z.object({
  id: z.uuid({ error: "Invalid category ID" }),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["price_asc", "price_desc", "ending_soon", "newest"]).optional(),
});
