import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/config/database";
import { autoBids, bids, products, users } from "@/models";
import { orderService } from "@/services/order.service";
import { BadRequestError, NotFoundError } from "@/utils/errors";

import { bidService } from "./bid.service";
import { emailService } from "./email.service";
import { productService } from "./product.service";

class AuctionService {
  /**
   * Chốt phiên đấu giá: xác định người thắng, cập nhật sản phẩm và tạo order.
   * Idempotent: nếu sản phẩm không còn ACTIVE hoặc đã quá trình xử lý, hàm sẽ thoát sớm.
   */
  async finalizeAuction(productId: string) {
    return db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          seller: { columns: { email: true } },
          winner: { columns: { email: true, fullName: true } },
        },
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
        where: and(eq(bids.productId, productId), eq(bids.status, "VALID")),
        orderBy: [desc(bids.amount), asc(bids.createdAt)],
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

        // Gửi email thông báo không có người mua
        emailService.notifyAuctionEndNoWinner(
          product.seller.email,
          product.name,
          productService.buildProductLink(productId)
        );

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
        false,
        tx
      );

      // Lấy thông tin winner để gửi email
      const winner = await tx.query.users.findFirst({
        where: eq(users.id, topBid.userId),
      });

      // Gửi email thông báo chúc mừng người thắng
      if (winner) {
        emailService.notifyAuctionEndSuccess(
          product.seller.email,
          winner.email,
          product.name,
          finalPrice,
          winner.fullName,
          productService.buildProductLink(productId)
        );
      }

      return { status: "completed", winnerId: topBid.userId, finalPrice };
    });
  }

  /**
   * Proxy Bidding (AutoBid) cho một sản phẩm.
   * Ý tưởng: giống eBay-style proxy:
   *  - Lấy tất cả auto-bids đang active.
   *  - Người có MaxBid cao nhất là winner.
   *  - Giá hiện tại = min(MaxBid_winner, MaxBid_thứ2 + StepPrice), và không thấp hơn currentPrice/startPrice.
   */
  async processAutoBid(productId: string) {
    return db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
      });

      if (!product) {
        throw new NotFoundError("Product");
      }

      // Chỉ xử lý trên phiên đang ACTIVE và chưa hết giờ
      const now = new Date();
      if (product.status !== "ACTIVE" || product.endTime <= now) {
        return { status: "skipped" as const };
      }

      // Lấy tất cả auto-bids đang active cho sản phẩm
      const proxies = await tx.query.autoBids.findMany({
        where: and(
          eq(autoBids.productId, productId),
          eq(autoBids.isActive, true)
        ),
        orderBy: (table, { desc, asc }) => [
          desc(table.maxAmount),
          asc(table.createdAt),
        ],
      });

      if (!proxies.length) {
        return { status: "no-proxy" as const };
      }

      const step = Number(product.stepPrice);
      const basePrice = product.currentPrice
        ? Number(product.currentPrice)
        : Number(product.startPrice);

      // Nếu chỉ có một auto-bidder
      if (proxies.length === 1) {
        const winner = proxies[0];
        // TH1: chưa ai đặt -> đặt = giá khởi điểm (hoặc giữ nguyên nếu đã có currentPrice)
        const newPrice = Math.min(parseFloat(winner.maxAmount), basePrice);

        if (product.winnerId === winner.userId) {
          return { status: "skipped" as const }; // Đã là người dẫn đầu, không cần đặt thêm
        }

        await bidService.placeBid(productId, winner.userId, newPrice, true, tx);

        return { status: "ok" as const, winnerId: winner.userId, newPrice };
      }

      // Nhiều auto-bidder: người đầu là MaxBid cao nhất, người thứ 2 là "giá giữ" thứ 2
      const top = proxies[0];
      const second = proxies[1];

      const topMax = Number(top.maxAmount);
      const secondMax = Number(second.maxAmount);

      // Kiểm tra nếu không thể tăng ít nhất một bước giá
      if (topMax < basePrice + step) {
        return { status: "skipped" as const };
      }

      // Giá đề xuất theo rule: secondMax (cho phép bidder đặt giá bằng secondMax để thắng nếu đến trước)
      // Không cộng thêm step vì bidder có thể đặt giá bằng secondMax và thắng theo thứ tự thời gian
      const suggestedPrice = Math.min(secondMax, topMax);

      // Đảm bảo giá đưa ra lớn hơn ít nhất một bước giá so với giá hiện tại
      const finalPrice = Math.max(basePrice + step, suggestedPrice);

      await bidService.placeBid(productId, top.userId, finalPrice, true, tx);

      return { status: "ok" as const, winnerId: top.userId, finalPrice };
    });
  }
}

export const auctionService = new AuctionService();
