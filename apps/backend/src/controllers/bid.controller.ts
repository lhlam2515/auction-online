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
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getBiddingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get bidding history of a product
    throw new NotImplementedError("Get bidding history not implemented yet");
  }
);

export const placeBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as PlaceBidRequest;
    // TODO: Place a bid on product
    throw new NotImplementedError("Place bid not implemented yet");
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
    throw new NotImplementedError("Create auto-bid not implemented yet");
  }
);

export const getAutoBid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's auto-bid for product
    // ResponseHandler.sendSuccess<AutoBid>(res, autoBid);
    throw new NotImplementedError("Get auto-bid not implemented yet");
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
