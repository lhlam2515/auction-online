import type { Bid, Product } from "@repo/shared-types";
import { eq, desc, and } from "drizzle-orm";

import { db } from "@/config/database";
import { bids, autoBids, products } from "@/models";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/errors";

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

  async placeBid(productId: string, bidderId: string, amount: number) {
    const product = await productService.getById(productId);

    let currentPrice = product.currentPrice
      ? parseFloat(product.currentPrice)
      : parseFloat(product.startPrice);

    if (amount >= currentPrice + parseFloat(product.stepPrice)) {
      currentPrice = currentPrice + parseFloat(product.stepPrice);
    } else {
      throw new BadRequestError(
        `Bid amount must be at least ${
          currentPrice + parseFloat(product.stepPrice)
        }`
      );
    }

    const [newBid] = await db
      .insert(bids)
      .values({
        productId: productId,
        userId: bidderId,
        amount: amount.toString(),
      })
      .returning();

    if (!newBid) {
      throw new BadRequestError("Failed to place bid");
    }

    // Update product current price
    await db
      .update(products)
      .set({ currentPrice: currentPrice.toString(), updatedAt: new Date() })
      .where(eq(products.id, productId));

    // Auto-extend nếu còn trong cửa sổ gia hạn
    await this.handleAutoExtend(product, productId);

    return newBid;
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
