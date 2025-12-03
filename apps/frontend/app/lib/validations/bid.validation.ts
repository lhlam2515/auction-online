import { z } from "zod";

/**
 * Factory function to create bid validation schema
 * @param currentPrice - Current highest bid price
 * @param stepPrice - Minimum bid increment
 * @returns Validation schema for bid amount
 * @description Creates dynamic validation based on current auction state
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
 * Basic bid validation schema
 * @description For cases where dynamic validation isn't needed
 */
export const baseBidSchema = z.object({
  amount: z
    .number({ error: "Giá tiền phải là số" })
    .int("Giá tiền phải là số nguyên")
    .min(1000, "Giá đấu tối thiểu là 1.000đ"),
});

/**
 * Bid schema type
 */
export type BidSchemaType = z.infer<typeof baseBidSchema>;
