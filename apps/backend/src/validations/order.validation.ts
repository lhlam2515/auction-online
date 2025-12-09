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

export const markPaidSchema = z.object({
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "CREDIT_CARD", "EWALLET"], {
    error: "Invalid payment method",
  }),
  transactionId: z.string().optional(),
  amount: z.coerce.number({ error: "Invalid amount" }).positive(),
});

export const updateShippingInfoSchema = z.object({
  shippingAddress: z.string({ error: "Shipping address is required" }).min(10, {
    message: "Shipping address is too short",
  }),
  phoneNumber: z.string().min(10, { error: "Phone number is required" }),
});

export const shipOrderSchema = z.object({
  trackingNumber: z.string({ error: "Tracking number is required" }),
  shippingProvider: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(10, { error: "Please provide a reason" }),
});

export const feedbackSchema = z.object({
  rating: z
    .int()
    .min(-1)
    .max(1)
    .refine((val) => val === 1 || val === -1, {
      error: "Rating must be -1 or 1",
    }),
  comment: z.string().optional(),
});
