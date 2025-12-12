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
import { ResponseHandler } from "@/utils/response";

export const getBiddingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const productId = req.params.id;
    const bids = await bidService.getHistory(productId);
    return ResponseHandler.sendSuccess<Bid[]>(res, bids);
  }
);

export const placeBid = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const { amount } = req.body as PlaceBidRequest;
    const productId = req.params.id;

    const bid = await bidService.placeBid(productId, userId, amount);
    return ResponseHandler.sendSuccess<Bid>(res, bid);
  }
);

export const kickBidder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: sellerId } = req.user!;
    const { bidderId, reason } = req.body as KickBidderRequest;
    const productId = req.params.id;

    const result = await bidService.kickBidder(
      productId,
      sellerId,
      bidderId,
      reason
    );
    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const createAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const { maxAmount } = req.body as CreateAutoBidRequest;
    const productId = req.params.id;

    const autoBid = await bidService.createAutoBid(
      productId,
      userId,
      maxAmount
    );
    return ResponseHandler.sendSuccess<AutoBid>(res, autoBid);
  }
);

export const getAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const productId = req.params.id;

    const autoBid = await bidService.getAutoBid(productId, userId);
    return ResponseHandler.sendSuccess<AutoBid>(res, autoBid);
  }
);

export const updateAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { maxAmount } = req.body as UpdateAutoBidRequest;
    const autoBidId = req.params.id;

    const result = await bidService.updateAutoBid(autoBidId, maxAmount);

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const deleteAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const autoBidId = req.params.id;
    const result = await bidService.deleteAutoBid(autoBidId, userId);

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);
