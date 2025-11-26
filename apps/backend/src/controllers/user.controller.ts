import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get current user profile
    throw new NotImplementedError("Get profile not implemented yet");
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Update user profile
    throw new NotImplementedError("Update profile not implemented yet");
  }
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Change user password
    throw new NotImplementedError("Change password not implemented yet");
  }
);

export const getPublicProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get public profile of another user
    throw new NotImplementedError("Get public profile not implemented yet");
  }
);

export const getRatingSummary = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user rating summary
    throw new NotImplementedError("Get rating summary not implemented yet");
  }
);

export const toggleWatchlist = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Add/Remove product from watchlist
    throw new NotImplementedError("Toggle watchlist not implemented yet");
  }
);

export const getWatchlist = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's watchlist
    throw new NotImplementedError("Get watchlist not implemented yet");
  }
);

export const getBiddingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's bidding history
    throw new NotImplementedError("Get bidding history not implemented yet");
  }
);

export const requestUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Request upgrade to Seller role
    throw new NotImplementedError("Request upgrade not implemented yet");
  }
);
