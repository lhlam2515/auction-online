import { z } from "zod";

export const orderIdSchema = z.object({
  id: z.uuid({ error: "Invalid order ID" }),
});

export const createOrderSchema = z.object({
  productId: z.uuid({ error: "Invalid product ID" }),
  winnerId: z.uuid({ error: "Invalid winner ID" }),
  sellerId: z.uuid({ error: "Invalid seller ID" }),
  finalPrice: z.coerce.number().positive(),
});

export const getOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const updatePaymentSchema = z.object({
  shippingAddress: z
    .string()
    .min(10, { error: "Shipping address is required" }),
  phoneNumber: z.string().min(10, { error: "Phone number is required" }),
});

export const shipOrderSchema = z.object({
  trackingNumber: z.string().optional(),
  shippingProvider: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(10, { error: "Please provide a reason" }),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
