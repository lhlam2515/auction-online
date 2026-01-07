import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.email().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  avatarUrl: z.url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { error: "Current password is required" }),
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

export const userIdSchema = z.object({
  id: z.uuid({ error: "Invalid user ID" }),
});

export const productIdSchema = z.object({
  productId: z.uuid({ error: "Invalid product ID" }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const upgradeRequestSchema = z.object({
  reason: z
    .string()
    .min(10, { error: "Please provide a reason (at least 10 characters)" }),
});
