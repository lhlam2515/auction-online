import { z } from "zod";

export const productIdSchema = z.object({
  id: z.uuid({ error: "Invalid product ID" }),
});

export const searchProductsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["ACTIVE", "PENDING", "ENDED", "CANCELLED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["price_asc", "price_desc", "ending_soon", "newest"]).optional(),
});

export const topListingSchema = z.object({
  type: z.enum(["ending_soon", "hot", "new"]),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createProductSchema = z.object({
  name: z.string().min(5, { error: "Name must be at least 5 characters" }),
  description: z
    .string()
    .min(20, { error: "Description must be at least 20 characters" }),
  categoryId: z.uuid({ error: "Invalid category ID" }),
  startPrice: z.coerce
    .number()
    .positive({ error: "Start price must be positive" }),
  stepPrice: z.coerce
    .number()
    .positive({ error: "Step price must be positive" }),
  buyNowPrice: z.coerce.number().positive().optional(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  images: z
    .array(z.string().url())
    .min(1, { error: "At least one image is required" }),
});

export const updateDescriptionSchema = z.object({
  content: z
    .string()
    .min(10, { error: "Content must be at least 10 characters" }),
});

export const autoExtendSchema = z.object({
  isAutoExtend: z.boolean(),
});
