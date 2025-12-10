import { eq, desc, and } from "drizzle-orm";
import { string, number } from "zod";

import { db } from "@/config/database";
import { updateAutoBid, deleteAutoBid } from "@/controllers/bid.controller";
import { bids, autoBids, products } from "@/models";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/errors";

export class BidService {
  async getHistory(productId: string) {
    // TODO: query bids for product ordered by time desc
    const productBids = await db
      .select({
        bids: bids,
      })
      .from(bids)
      .where(eq(bids.productId, productId))
      .orderBy(desc(bids.createdAt));

    if (!productBids || productBids.length === 0) {
      throw new NotFoundError("No bids found for this product");
    }
    return productBids.map((item) => item.bids);
  }

  async placeBid(productId: string, bidderId: string, amount: number) {
    // TODO: validate bid amount against current price and auto-bid rules
    const newBid = await db
      .insert(bids)
      .values({
        productId: productId,
        userId: bidderId,
        amount: amount.toString(),
      })
      .returning();

    if (!newBid || newBid.length === 0) {
      throw new BadRequestError("Failed to place bid");
    }
    return newBid[0];
  }

  async kickBidder(
    productId: string,
    sellerId: string,
    bidderId: string,
    reason?: string
  ) {
    // TODO: validate seller ownership and kick logic
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
    return true;
  }

  async createAutoBid(
    productId: string,
    userId: string,
    maxAmount: number,
    step?: number
  ) {
    // TODO: upsert auto-bid config
    const checkExisting = await db
      .select()
      .from(autoBids)
      .where(
        and(eq(autoBids.productId, productId), eq(autoBids.userId, userId))
      );
    if (checkExisting && checkExisting.length > 0) {
      throw new BadRequestError("Auto-bid configuration already exists");
    }

    const newAutoBid = await db
      .insert(autoBids)
      .values({
        productId: productId,
        userId: userId,
        maxAmount: maxAmount.toString(),
        isActive: true,
      })
      .returning();

    if (!newAutoBid || newAutoBid.length === 0) {
      throw new BadRequestError("Failed to create auto-bid configuration");
    }
    return newAutoBid[0];
  }

  async getAutoBid(productId: string, userId: string) {
    // TODO: fetch user's auto-bid
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

  async updateAutoBid(autoBidId: string, maxAmount: number, step?: number) {
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
    return true;
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
    return true;
  }
}

export const bidService = new BidService();
