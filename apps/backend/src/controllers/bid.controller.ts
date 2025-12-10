import type {
  Bid,
  PlaceBidRequest,
  KickBidderRequest,
  CreateAutoBidRequest,
  UpdateAutoBidRequest,
  AutoBid,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { bidService } from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getBiddingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get bidding history of a product
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const productId = req.params.id;
    const bids = await bidService.getHistory(productId);
    return ResponseHandler.sendSuccess<Bid[]>(res, bids);
  }
);

export const placeBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as PlaceBidRequest;
    // TODO: Place a bid on product
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const productId = req.params.id;
    const userId = req.user.id;
    const amount = body.amount;
    const bid = await bidService.placeBid(productId, userId, amount);
    return ResponseHandler.sendSuccess<Bid>(res, bid);
  }
);

export const kickBidder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as KickBidderRequest;
    // TODO: Kick a bidder from product
    throw new NotImplementedError("Kick bidder not implemented yet");
  }
);

export const createAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as CreateAutoBidRequest;
    // TODO: Create auto-bid configuration
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const productId = req.params.id;
    const userId = req.user.id;
    const maxAmount = body.maxAmount;
    const autoBid = await bidService.createAutoBid(
      productId,
      userId,
      maxAmount
    );
    return ResponseHandler.sendSuccess<AutoBid>(res, autoBid);
  }
);

export const getAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's auto-bid for product
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const productId = req.params.id;
    const userId = req.user.id;
    const autoBid = await bidService.getAutoBid(productId, userId);
    return ResponseHandler.sendSuccess<AutoBid>(res, autoBid);
  }
);

export const updateAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpdateAutoBidRequest;
    // TODO: Update auto-bid configuration
    throw new NotImplementedError("Update auto-bid not implemented yet");
  }
);

export const deleteAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Delete auto-bid configuration
    throw new NotImplementedError("Delete auto-bid not implemented yet");
  }
);
