import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpgradeRequestData,
  PublicProfile,
  UserRatingSummary,
  Product,
  Bid,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { userService } from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get current user profile
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }

    const userId = req.user.id;
    const user = await userService.getById(userId);
    if (!user) {
      throw new NotImplementedError("User not found");
    }
    return ResponseHandler.sendSuccess<User>(res, user);
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpdateProfileRequest;
    // TODO: Update user profile
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userId = req.user.id;
    const updatedUser = await userService.updateProfile(
      userId,
      body.fullName,
      body.address,
      body.avatarUrl
    );
    return ResponseHandler.sendSuccess<User>(res, updatedUser);
  }
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as ChangePasswordRequest;
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userId = req.user.id;
    const email = req.user.email;
    await userService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword
    );
    return ResponseHandler.sendSuccess<string>(res, "Password updated");
  }
);

export const getPublicProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get public profile of another user
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const publicID = req.params.id;
    const publicProfile = await userService.getById(publicID);
    if (!publicProfile) {
      throw new NotImplementedError("Public profile not found");
    }
    return ResponseHandler.sendSuccess<PublicProfile>(res, publicProfile);
  }
);

export const getRatingSummary = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user rating summary
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userID = req.params.id;
    const ratingSummary = await userService.getById(userID);
    if (!ratingSummary) {
      throw new NotImplementedError("Rating summary not found");
    }
    return ResponseHandler.sendSuccess<UserRatingSummary>(res, {
      averageRating: ratingSummary.ratingScore,
      totalRatings: ratingSummary.ratingCount,
    });
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
    const body = req.body as UpgradeRequestData;
    // TODO: Request upgrade to Seller role
    throw new NotImplementedError("Request upgrade not implemented yet");
  }
);
