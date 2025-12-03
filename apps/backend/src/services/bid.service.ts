import { db } from "@/config/database";
import { bids, autoBids } from "@/models";
import { eq, desc } from "drizzle-orm";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/errors";

export class BidService {
  async getHistory(productId: string) {
    // TODO: query bids for product ordered by time desc
    return [];
  }

  async placeBid(productId: string, bidderId: string, amount: number) {
    // TODO: validate bid amount against current price and auto-bid rules
    throw new BadRequestError("Not implemented");
  }

  async kickBidder(
    productId: string,
    sellerId: string,
    bidderId: string,
    reason?: string
  ) {
    // TODO: validate seller ownership and kick logic
    throw new ForbiddenError("Not implemented");
  }

  async createAutoBid(
    productId: string,
    userId: string,
    maxAmount: number,
    step?: number
  ) {
    // TODO: upsert auto-bid config
    throw new BadRequestError("Not implemented");
  }

  async getAutoBid(productId: string, userId: string) {
    // TODO: fetch user's auto-bid
    return null;
  }

  async updateAutoBid(autoBidId: string, maxAmount?: number, step?: number) {
    // TODO: update config
    return true;
  }

  async deleteAutoBid(autoBidId: string, userId: string) {
    // TODO: soft delete/disable
    return true;
  }
}

export const bidService = new BidService();
