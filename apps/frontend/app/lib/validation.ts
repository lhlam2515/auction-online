import { UPLOAD_LIMITS } from "@/constants/api";
import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.email("Email không đúng định dạng").min(1, "Vui lòng nhập email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

/**
 * User registration form validation schema
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(50, "Họ tên quá dài"),
    email: z.email("Email không đúng định dạng").min(1, "Vui lòng nhập email"),
    password: z.string().min(8, "Mật khẩu phải có tối thiểu 8 ký tự"), //
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

/**
 * OTP (One-Time Password) verification schema
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có đúng 6 ký tự số") // [cite: 665]
    .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Nhập mật khẩu cũ"),
    newPassword: z.string().min(8, "Mật khẩu mới phải tối thiểu 8 ký tự"),
    confirmNewPassword: z.string().min(1, "Xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "Mật khẩu mới không được trùng mật khẩu cũ", // [cite: 648]
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

/**
 * Image file validation schema
 */
const imageFileSchema = z
  .any()
  .refine(
    (file) => file?.size <= UPLOAD_LIMITS.MAX_FILE_SIZE,
    `Kích thước ảnh tối đa là 5MB`
  )
  .refine(
    (file) => UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file?.type),
    "Chỉ chấp nhận định dạng .jpg, .jpeg, .png"
  );

/**
 * Product creation/auction form validation schema
 */
export const productSchema = z
  .object({
    name: z.string().min(10, "Tên sản phẩm tối thiểu 10 ký tự").max(100),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),

    // Giá tiền
    startPrice: z
      .number({ error: "Vui lòng nhập số" })
      .min(1000, "Giá khởi điểm tối thiểu 1000đ"),
    stepPrice: z.number().int().min(1000, "Bước giá tối thiểu 1000đ"),
    buyNowPrice: z.number().optional().nullable(), // Có thể null

    // Thời gian
    startTime: z.date().optional(), // Nếu để trống thì là Now
    endTime: z.date({ error: "Vui lòng chọn ngày kết thúc" }),

    // Mô tả
    description: z
      .string()
      .min(20, "Mô tả cần chi tiết hơn (tối thiểu 20 ký tự)"),

    // Ảnh: Tối thiểu 4 ảnh
    images: z
      .array(imageFileSchema)
      .min(3, "Vui lòng tải lên tối thiểu 4 ảnh")
      .max(10, "Tối đa 10 ảnh"),

    autoExtend: z.boolean().default(true),
  })
  // Refine 1: Giá mua ngay > Giá khởi điểm + Bước giá (nếu có nhập)
  .refine(
    (data) => {
      if (!data.buyNowPrice) return true;
      return data.buyNowPrice >= data.startPrice + data.stepPrice;
    },
    {
      message: "Giá mua ngay phải lớn hơn giá khởi điểm",
      path: ["buyNowPrice"],
    }
  )
  // Refine 2: Ngày kết thúc phải sau ngày bắt đầu (hoặc sau hiện tại)
  .refine(
    (data) => {
      const start = data.startTime || new Date();
      return data.endTime > start;
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endTime"],
    }
  );

/**
 * Factory function to create bid validation schema
 */
export const createBidSchema = (currentPrice: number, stepPrice: number) => {
  const minBid = currentPrice + stepPrice;

  return z.object({
    amount: z
      .number({ error: "Giá tiền phải là số" })
      .int("Giá tiền phải là số nguyên")
      .min(minBid, `Giá đấu tối thiểu hợp lệ là ${minBid.toLocaleString()} đ`),
  });
};

/**
 * User profile update validation schema
 *
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên quá ngắn"),
  email: z.email("Email không hợp lệ"),
  birthDate: z.coerce.date().max(new Date(), "Ngày sinh không hợp lệ"),
});

/**
 * User rating validation schema
 */
export const ratingSchema = z.object({
  score: z.union([z.literal(1), z.literal(-1)], {
    error: "Vui lòng chọn Like (+1) hoặc Dislike (-1)",
  }),
  comment: z.string().max(200, "Đánh giá tối đa 200 ký tự").optional(),
});

/**
 * Account upgrade request validation schema
 * @description Validates seller account upgrade requests with reason and terms agreement
 * @remarks Requires explicit agreement to terms (must be true)
 */
export const upgradeRequestSchema = z.object({
  reason: z
    .string()
    .min(20, "Vui lòng nhập lý do cụ thể hơn (tối thiểu 20 ký tự)")
    .max(500, "Lý do tối đa 500 ký tự"),
  agreedToTerms: z.literal(true, {
    error: "Bạn phải đồng ý với cam kết",
  }),
});
