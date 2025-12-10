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
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;

    const user = await userService.getById(userId);

    return ResponseHandler.sendSuccess<User>(res, user);
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { fullName, address, avatarUrl } = req.body as UpdateProfileRequest;
    const { id: userId } = req.user!;

    const updatedUser = await userService.updateProfile(
      userId,
      fullName,
      address,
      avatarUrl
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
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userId = req.user.id;
    const productId = req.params.productId;
    const exists = await userService.checkInWatchlist(userId, productId);
    if (exists) {
      await userService.removeFromWatchlist(userId, productId);
      return ResponseHandler.sendSuccess<string>(
        res,
        "Product removed from watchlist"
      );
    } else {
      await userService.addToWatchlist(userId, productId);
      return ResponseHandler.sendSuccess<string>(
        res,
        "Product added to watchlist"
      );
    }
  }
);

export const getWatchlist = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's watchlist
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userId = req.user.id;
    const watchlist = await userService.getWatchlist(userId);
    return ResponseHandler.sendSuccess<Product[]>(res, watchlist);
  }
);

export const getBiddingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's bidding history
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userId = req.user.id;
    const biddingHistory = await userService.getBiddingHistory(userId);
    return ResponseHandler.sendSuccess<Bid[]>(res, biddingHistory);
  }
);

export const requestUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as UpgradeRequestData;
    // TODO: Request upgrade to Seller role
    if (!req.user || !req.user.id) {
      throw new NotImplementedError("User not authenticated");
    }
    const userId = req.user.id;
    const reason = body.reason;

    const request = await userService.requestUpgradeToSeller(userId, reason);
    return ResponseHandler.sendSuccess<any>(res, request);
  }
);
