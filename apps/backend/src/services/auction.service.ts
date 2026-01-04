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
   * Proxy Bidding (AutoBid) Logic
   * Rule:
   * 1. Nếu chỉ có 1 AutoBidder: Bid = Giá hiện tại + Step (nhưng không quá Max).
   * 2. Nếu có nhiều AutoBidder: Bid = Max của người về nhì + Step (nhưng không quá Max của người nhất).
   * 3. Ưu tiên thời gian: Nếu Max bằng nhau, người đến trước thắng (giữ nguyên giá Max đó).
   */
  async processAutoBid(productId: string) {
    return db.transaction(async (tx) => {
      // 1. Lấy thông tin sản phẩm (Lock row if needed for high concurrency)
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for("update");

      if (
        !product ||
        product.status !== "ACTIVE" ||
        product.endTime <= new Date()
      ) {
        return { status: "skipped" as const };
      }

      // 2. Lấy danh sách AutoBids active, sort giảm dần theo tiền, tăng dần theo thời gian
      // (Người đặt cao nhất và sớm nhất sẽ ở index 0)
      const proxies = await tx.query.autoBids.findMany({
        where: and(
          eq(autoBids.productId, productId),
          eq(autoBids.isActive, true)
        ),
        orderBy: (table, { desc, asc }) => [
          desc(table.maxAmount),
          asc(table.updatedAt),
        ],
      });

      if (!proxies.length) {
        return { status: "no-proxy" as const };
      }

      const step = Number(product.stepPrice);
      const currentPrice = Number(product.currentPrice || product.startPrice);

      const topBidder = proxies[0];
      const topMax = Number(topBidder.maxAmount);

      // --- LOGIC TÍNH TOÁN GIÁ MỚI ---
      let newPrice = currentPrice;

      // TRƯỜNG HỢP 1: Chỉ có 1 người đặt AutoBid (hoặc người này áp đảo hoàn toàn)
      // Đối thủ là "Giá hiện tại" (do người manual bid tạo ra)
      if (proxies.length === 1) {
        // Nếu người này đang thắng rồi thì thôi, không tự nâng giá mình lên
        if (product.winnerId === topBidder.userId) {
          return { status: "skipped" as const };
        }

        // Nếu chưa thắng, cần bid mức: Giá hiện tại + Step
        // Giá vào sản phẩm luôn là giá vừa đủ thắng
        newPrice = currentPrice + step;
      }

      // TRƯỜNG HỢP 2: Có cạnh tranh giữa các AutoBidder
      else {
        const secondBidder = proxies[1];
        const secondMax = Number(secondBidder.maxAmount);

        // Kiểm tra xem Top và Second có phải cùng 1 người không?
        // (User tự nâng MaxBid thì không tính là cạnh tranh giá với chính mình)
        if (topBidder.userId === secondBidder.userId) {
          // Logic tương tự trường hợp 1
          if (product.winnerId === topBidder.userId)
            return { status: "skipped" as const };
          newPrice = currentPrice + step;
        } else {
          // Cạnh tranh thật sự:
          // Giá sàn để thắng được người thứ 2 là: Max của người thứ 2 + Step
          // Ví dụ bảng: User#1 max 11m, User#3 max 11.5m -> Giá sp 11.1m (11m + step)
          newPrice = secondMax + step;

          // Xử lý trường hợp HÒA (Tie):
          // Nếu TopMax == SecondMax, do sort theo updateAt ASC nên Top là người đến trước.
          // Top sẽ thắng tại đúng mức giá Max đó (không cộng step vì sẽ vượt Max).
          if (topMax === secondMax) {
            newPrice = topMax;
          }
        }
      }

      // --- RÀNG BUỘC CUỐI CÙNG (CLAMPING) ---

      // 1. Không được vượt quá MaxBid của người thắng
      newPrice = Math.min(newPrice, topMax);

      // 2. Phải đảm bảo logic Bước giá so với giá hiện tại (nếu đang thua)
      // Nếu newPrice tính ra mà <= currentPrice (do max thấp), thì không thể bid.
      if (newPrice <= currentPrice && product.winnerId !== topBidder.userId) {
        // Trường hợp này AutoBidder này đã thua (Max < Current + Step)
        // Đáng lẽ query DB không nên lấy ra hoặc logic placeBid sẽ throw error
        return { status: "failed_max_too_low" as const };
      }

      // 3. Nếu giá không đổi và người thắng không đổi -> Bỏ qua
      if (newPrice === currentPrice && product.winnerId === topBidder.userId) {
        return { status: "skipped" as const };
      }

      // --- THỰC HIỆN RA GIÁ ---
      // Gọi service placeBid (lưu ý truyền flag isAutoBid=true để tránh vòng lặp vô tận nếu có trigger)
      await bidService.placeBid(
        productId,
        topBidder.userId,
        newPrice,
        true,
        tx
      );

      return {
        status: "ok" as const,
        winnerId: topBidder.userId,
        price: newPrice,
      };
    });
  }
}

export const auctionService = new AuctionService();
