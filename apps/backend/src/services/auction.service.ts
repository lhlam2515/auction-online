import { desc, eq } from "drizzle-orm";

import { db } from "@/config/database";
import { bids, products } from "@/models";
import { orderService } from "@/services/order.service";
import { BadRequestError, NotFoundError } from "@/utils/errors";

class AuctionService {
  /**
   * Chốt phiên đấu giá: xác định người thắng, cập nhật sản phẩm và tạo order.
   * Idempotent: nếu sản phẩm không còn ACTIVE hoặc đã quá trình xử lý, hàm sẽ thoát sớm.
   */
  async finalizeAuction(productId: string) {
    return db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
      });

      if (!product) {
        throw new NotFoundError("Product");
      }

      // Chỉ xử lý khi đang ACTIVE và đã hết thời gian
      const now = new Date();
      if (product.status !== "ACTIVE") {
        return { status: "skipped", reason: "not-active" };
      }
      if (product.endTime > now) {
        throw new BadRequestError("Auction has not ended yet");
      }

      // Lấy bid cao nhất (ưu tiên amount cao, rồi đến thời gian sớm hơn)
      const topBid = await tx.query.bids.findFirst({
        where: eq(bids.productId, productId),
        orderBy: [desc(bids.amount), desc(bids.createdAt)],
      });

      // Không có bid hợp lệ -> đánh dấu NO_SALE
      if (!topBid) {
        await tx
          .update(products)
          .set({
            status: "NO_SALE",
            winnerId: null,
            currentPrice: String(
              Number(product.currentPrice ?? product.startPrice)
            ),
            endTime: now,
            updatedAt: now,
          })
          .where(eq(products.id, productId));

        return { status: "no_sale" };
      }

      const finalPrice = Number(topBid.amount);

      // Cập nhật sản phẩm thành SOLD và set winner
      await tx
        .update(products)
        .set({
          status: "SOLD",
          winnerId: topBid.userId,
          currentPrice: finalPrice.toString(),
          endTime: now,
          updatedAt: now,
        })
        .where(eq(products.id, productId));

      // Tạo order từ phiên đấu giá
      await orderService.createFromAuction(
        productId,
        topBid.userId,
        product.sellerId,
        finalPrice,
        false
      );

      // TODO: enqueue email thông báo người thắng cuộc
      return { status: "completed", winnerId: topBid.userId, finalPrice };
    });
  }
}

export const auctionService = new AuctionService();
