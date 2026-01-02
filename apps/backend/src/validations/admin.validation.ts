import { z } from "zod";

export const userIdSchema = z.object({
  id: z.uuid({ error: "Invalid user ID" }),
});

export const productIdSchema = z.object({
  id: z.uuid({ error: "Invalid product ID" }),
});

export const categoryIdSchema = z.object({
  id: z.uuid({ error: "Invalid category ID" }),
});

export const upgradeIdSchema = z.object({
  id: z.uuid({ error: "Invalid upgrade request ID" }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["BIDDER", "SELLER", "ADMIN"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z.string().optional(),
  lockoutEnd: z.iso.datetime().optional(),
});

export const getUpgradesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export const processUpgradeSchema = z.object({
  adminNote: z.string().optional(),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "ACTIVE", "ENDED", "CANCELLED"]).optional(),
  search: z.string().optional(),
});

export const rejectProductSchema = z.object({
  reason: z.string().min(10, { error: "Please provide a reason" }),
});

export const suspendProductSchema = z.object({
  reason: z.string().min(10, { error: "Please provide a reason" }),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, { error: "Category name must be at least 2 characters" }),
  parentId: z.uuid().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2),
});
