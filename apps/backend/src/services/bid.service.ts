import type { Bid } from "@repo/shared-types";
import { eq, desc, and } from "drizzle-orm";

import { db } from "@/config/database";
import { bids, autoBids, products } from "@/models";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/errors";
import { feedbackSchema } from "@/validations/order.validation";

import { productService } from "./product.service";

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
      .set({
        currentPrice: currentPrice.toString(),
        updatedAt: new Date(),
        winnerId: bidderId,
      })
      .where(eq(products.id, productId));

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
    await db
      .update(autoBids)
      .set({ isActive: false })
      .where(
        and(eq(autoBids.productId, productId), eq(autoBids.userId, bidderId))
      );

    if (ownerCheck.winnerId === bidderId) {
      const secondWinner = await db.query.bids.findFirst({
        where: and(eq(bids.productId, productId), eq(bids.status, "VALID")),
        orderBy: desc(bids.amount),
      });
      console.log(secondWinner);
      await db
        .update(products)
        .set({
          currentPrice: secondWinner?.amount || "",
          winnerId: secondWinner?.userId || "",
        })
        .where(eq(products.id, productId));
    }

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
}

export const bidService = new BidService();
