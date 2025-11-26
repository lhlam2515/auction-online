import { z } from "zod";

export const getProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "PENDING", "ENDED", "CANCELLED"]).optional(),
});

export const getOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"])
    .optional(),
});
