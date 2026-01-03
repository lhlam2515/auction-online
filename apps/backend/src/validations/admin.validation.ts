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
  accountStatus: z
    .enum(["PENDING_VERIFICATION", "ACTIVE", "BANNED"])
    .optional(),
  q: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "fullName", "email", "ratingScore"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z
    .string()
    .min(10, { error: "Reason must be at least 10 characters" })
    .optional(),
  duration: z.number().int().min(0).optional(), // days, 0 = permanent
});

export const updateUserInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, { error: "Full name must be at least 2 characters" })
    .optional(),
  address: z.string().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Birth date must be in YYYY-MM-DD format",
    })
    .optional(),
});

export const updateAccountStatusSchema = z.object({
  accountStatus: z.enum(["PENDING_VERIFICATION", "ACTIVE", "BANNED"]),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["BIDDER", "SELLER", "ADMIN"], {
    error: "Role must be BIDDER, SELLER, or ADMIN",
  }),
});

export const resetUserPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" }),
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
  status: z.enum(["ACTIVE", "SOLD", "NO_SALE", "SUSPENDED"]).optional(),
  q: z.string().optional(),
  categoryId: z.uuid().optional(),
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

export const createUserSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must not exceed 30 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["BIDDER", "SELLER", "ADMIN"]).default("BIDDER"),
  address: z.string().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Birth date must be in YYYY-MM-DD format",
    })
    .optional(),
});

export const deleteUserSchema = z.object({
  reason: z
    .string()
    .min(10, { message: "Reason must be at least 10 characters" })
    .optional(),
});
