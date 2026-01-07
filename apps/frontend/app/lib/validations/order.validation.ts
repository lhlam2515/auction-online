import { z } from "zod";

/**
 * Shipping information update validation schema
 * @description Validates shipping address and phone number updates
 */
export const updateShippingInfoSchema = z.object({
  shippingAddress: z.string().min(10, "Địa chỉ giao hàng quá ngắn"),
  phoneNumber: z
    .string()
    .regex(
      /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-4|6-9])[0-9]{7}$/,
      {
        message: "Số điện thoại không hợp lệ",
      }
    ),
});

/**
 * Submit feedback validation schema
 * @description Validates user feedback submissions with rating and optional comment
 */
export const submitFeedbackSchema = z.object({
  rating: z
    .union([z.literal(1), z.literal(-1), z.literal(0)])
    .refine((val) => val !== 0, {
      message: "Vui lòng chọn đánh giá Tích cực (+1) hoặc Tiêu cực (-1)",
    }),
  comment: z.string().optional(),
});

/**
 * Order shipping submission validation schema
 * @description Validates shipping provider, tracking number, and optional notes
 */
export const submitOrderShippingSchema = z.object({
  shippingProvider: z.enum(["GHN", "VNPOST", "GHTK", "JNT"], {
    error: "Vui lòng chọn đơn vị vận chuyển",
  }),
  trackingNumber: z
    .string()
    .min(1, "Mã vận đơn không được để trống")
    .max(50, "Mã vận đơn quá dài"),
});
