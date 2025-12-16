import type { Bid, Product, ProductStatus } from "@repo/shared-types";
import { eq, desc, and } from "drizzle-orm";

import { db } from "@/config/database";
import { bids, autoBids, products } from "@/models";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/errors";

import { orderService } from "./order.service";
import { productService } from "./product.service";
import { systemService } from "./system.service";

export class BidService {
  async getHistory(productId: string) {
    const product = await productService.getById(productId);

    const productBids = await db.query.bids.findMany({
      where: eq(bids.productId, product.id),
      orderBy: desc(bids.createdAt),
    });

    return productBids || ([] as Bid[]);
  }

  async placeBid(
    productId: string,
    bidderId: string,
    amount: number,
    isAuto: boolean = false,
    inputTx?: unknown
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const executeLogic = async (tx: any) => {
      let product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
      });

      if (!product) throw new NotFoundError("Product");

      if (product.sellerId === bidderId) {
        throw new BadRequestError(
          "Không thể tự đấu giá sản phẩm của chính mình"
        );
      }
      if (product.status !== "ACTIVE") {
        throw new BadRequestError("Phiên đấu giá không khả dụng");
      }

      const now = new Date();
      if (product.startTime > now)
        throw new BadRequestError("Phiên đấu giá chưa bắt đầu");
      if (product.endTime < now)
        throw new BadRequestError("Phiên đấu giá đã kết thúc");

      if (product.winnerId === bidderId) {
        throw new BadRequestError("Bạn đang là người giữ giá cao nhất rồi!");
      }

      const currentPrice = parseFloat(
        product.currentPrice || product.startPrice
      );
      const stepPrice = parseFloat(product.stepPrice);

      // Logic: Nếu chưa có ai bid (currentPrice == startPrice và chưa có winner),
      // thì bid tối thiểu = startPrice.
      // Nếu đã có người bid, thì bid tối thiểu = currentPrice + stepPrice.
      const minBidAmount = currentPrice + (!product.winnerId ? 0 : stepPrice);

      if (amount < minBidAmount) {
        throw new BadRequestError(
          `Giá đặt phải tối thiểu là ${minBidAmount.toString()}`
        );
      }

      // 5. Insert Bid mới
      const [newBid] = await tx
        .insert(bids)
        .values({
          productId: productId,
          userId: bidderId,
          amount: amount.toString(),
          isAuto,
          createdAt: new Date(),
        })
        .returning();

      if (!newBid)
        throw new BadRequestError("Đặt giá thất bại, vui lòng thử lại");

      // Kiểm tra xem giá này có kích hoạt "Mua ngay" (Buy Now) không?
      let newStatus = "ACTIVE";
      const buyNowPrice = product.buyNowPrice
        ? parseFloat(product.buyNowPrice)
        : null;

      if (buyNowPrice && amount >= buyNowPrice) {
        newStatus = "SOLD";
      }

      [product] = await tx
        .update(products)
        .set({
          currentPrice: amount.toString(),
          winnerId: bidderId,
          status: newStatus as ProductStatus,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      if (newStatus === "SOLD") {
        // Hủy tất cả auto-bids còn lại
        await tx
          .update(autoBids)
          .set({ isActive: false, updatedAt: new Date() })
          .where(
            and(eq(autoBids.productId, productId), eq(autoBids.isActive, true))
          );

        // Tạo đơn hàng ngay khi đấu thành công
        await orderService.createFromAuction(
          productId,
          bidderId,
          product.sellerId,
          amount,
          true
        );
      }

      return {
        newBid,
        product,
        isBuyNow: newStatus === "SOLD",
      };
    };

    // Thực thi Transaction
    const result = inputTx
      ? await executeLogic(inputTx)
      : await db.transaction(executeLogic);

    // --- LOGIC SAU TRANSACTION (Non-blocking) ---
    // 1. Xử lý Auto-Extend (Anti-Sniping)
    // Nếu bid vào những phút cuối, tự động gia hạn thêm thời gian
    if (result.product.status === "ACTIVE") {
      await this.handleAutoExtend(result.product, productId);
    }

    // 2. Kích hoạt Auto-bid queue
    // Chỉ kích hoạt nếu chưa phải là Buy Now
    if (!result.isBuyNow) {
      await systemService.triggerAutoBidCheck(productId);
    }

    return result.newBid;
  }

  async kickBidder(
    productId: string,
    sellerId: string,
    bidderId: string,
    reason?: string
  ) {
    const ownerCheck = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
    });

    if (!ownerCheck) {
      throw new ForbiddenError("You are not the owner of this product");
    }

    await db
      .update(bids)
      .set({ status: "INVALID" })
      .where(
        and(
          eq(bids.productId, productId),
          eq(bids.userId, bidderId),
          eq(bids.status, "VALID")
        )
      );

    // Cập nhật lại giá hiện tại và người giữ giá cao nhất
    const topBid = await db.query.bids.findFirst({
      where: and(
        eq(bids.productId, productId),
        eq(bids.status, "VALID")
        // Loại bỏ bidder bị kick
        // Note: Không dùng neq vì có thể có nhiều bidder bị kick
        // Nên sẽ lọc thủ công bên dưới
      ),
      orderBy: desc(bids.amount),
    });

    const product = await productService.getById(productId);

    if (topBid) {
      await db
        .update(products)
        .set({
          currentPrice: topBid.amount,
          winnerId: topBid.userId,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    } else {
      // Không còn ai giữ giá, reset về giá khởi điểm
      await db
        .update(products)
        .set({
          currentPrice: product.startPrice,
          winnerId: null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    }

    // Hủy tất cả auto-bids của bidder bị kick
    await db
      .update(autoBids)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(autoBids.productId, productId),
          eq(autoBids.userId, bidderId),
          eq(autoBids.isActive, true)
        )
      );

    // Kích hoạt Auto-bid queue để tìm người giữ giá mới
    await systemService.triggerAutoBidCheck(productId);

    // TODO: Send notification to bidder about being kicked

    return { message: "Bidder kicked successfully" };
  }

  async createAutoBid(productId: string, userId: string, maxAmount: number) {
    const checkExisting = await db.query.autoBids.findFirst({
      where: and(
        eq(autoBids.productId, productId),
        eq(autoBids.userId, userId)
      ),
    });

    if (checkExisting) {
      throw new BadRequestError(
        "Auto-bid configuration already exists for this product"
      );
    }

    const [newAutoBid] = await db
      .insert(autoBids)
      .values({
        productId: productId,
        userId: userId,
        maxAmount: maxAmount.toString(),
        isActive: true,
      })
      .returning();

    if (!newAutoBid) {
      throw new BadRequestError("Failed to create auto-bid configuration");
    }

    // Kích hoạt Auto-bid queue ngay sau khi tạo
    await systemService.triggerAutoBidCheck(productId);

    return newAutoBid;
  }

  async getAutoBid(productId: string, userId: string) {
    const autoBid = await db.query.autoBids.findFirst({
      where: and(
        eq(autoBids.productId, productId),
        eq(autoBids.userId, userId)
      ),
    });
    if (!autoBid) {
      throw new NotFoundError("Auto-bid configuration not found");
    }
    return autoBid;
  }

  async updateAutoBid(autoBidId: string, maxAmount: number) {
    const autoBid = await db.query.autoBids.findFirst({
      where: and(eq(autoBids.id, autoBidId), eq(autoBids.isActive, true)),
    });

    if (!autoBid) {
      throw new NotFoundError("Auto-bid configuration not found");
    }

    await db
      .update(autoBids)
      .set({
        maxAmount: maxAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(autoBids.id, autoBidId));

    // Kích hoạt Auto-bid queue ngay sau khi cập nhật
    await systemService.triggerAutoBidCheck(autoBid.productId);

    return { message: "Auto-bid configuration updated successfully" };
  }

  async deleteAutoBid(autoBidId: string, userId: string) {
    const autoBid = await db.query.autoBids.findFirst({
      where: and(eq(autoBids.id, autoBidId), eq(autoBids.userId, userId)),
    });

    if (!autoBid) {
      throw new NotFoundError("Auto-bid configuration not found");
    }

    await db
      .delete(autoBids)
      .where(and(eq(autoBids.id, autoBidId), eq(autoBids.userId, userId)));

    return { message: "Auto-bid configuration deleted successfully" };
  }

  private async getAutoExtendConfig() {
    const settings = await db.query.auctionSettings.findFirst({
      orderBy: (table, { desc }) => [desc(table.updatedAt)],
    });

    return {
      thresholdMinutes: settings?.extendThresholdMinutes ?? 5,
      durationMinutes: settings?.extendDurationMinutes ?? 10,
    };
  }

  private async handleAutoExtend(product: Product, productId: string) {
    if (!product.isAutoExtend) return;

    const { thresholdMinutes, durationMinutes } =
      await this.getAutoExtendConfig();
    const now = new Date();
    const productEnd = new Date(product.endTime);
    const timeLeftMs = productEnd.getTime() - now.getTime();

    if (timeLeftMs <= 0) return;

    const thresholdMs = thresholdMinutes * 60 * 1000;
    if (timeLeftMs > thresholdMs) return;

    const newEndTime = new Date(
      productEnd.getTime() + durationMinutes * 60 * 1000
    );

    await db
      .update(products)
      .set({ endTime: newEndTime, updatedAt: new Date() })
      .where(eq(products.id, productId));

    await systemService.rescheduleAuctionEnd(productId, newEndTime);
  }
}

export const bidService = new BidService();
