import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpgradeRequestData,
  UpgradeRequestResponse,
  PublicProfile,
  UserRatingSummary,
  Product,
  MyAutoBid,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { userService } from "@/services";
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
    const { fullName, address, birthDate, avatarUrl } =
      req.body as UpdateProfileRequest;
    const { id: userId } = req.user!;

    const updatedUser = await userService.updateProfile(
      userId,
      fullName,
      address,
      birthDate,
      avatarUrl
    );

    return ResponseHandler.sendSuccess<User>(res, updatedUser);
  }
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { email } = req.user!;
    const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

    const result = await userService.changePassword(
      email,
      currentPassword,
      newPassword
    );

    return ResponseHandler.sendSuccess(res, null, 200, result.message);
  }
);

export const getPublicProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: publicId } = req.params;

    const publicProfile = await userService.getPublicProfile(publicId);

    return ResponseHandler.sendSuccess<PublicProfile>(res, publicProfile);
  }
);

export const getRatingSummary = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userID } = req.params;

    const ratingSummary = await userService.getById(userID);

    return ResponseHandler.sendSuccess<UserRatingSummary>(res, {
      averageRating: ratingSummary.ratingScore,
      totalRatings: ratingSummary.ratingCount,
    });
  }
);

export const toggleWatchlist = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const productId = req.params.productId;

    const exists = await userService.checkInWatchlist(userId, productId);
    if (exists) {
      const result = await userService.removeFromWatchlist(userId, productId);
      return ResponseHandler.sendSuccess(
        res,
        result,
        200,
        "Product removed from watchlist"
      );
    } else {
      const result = await userService.addToWatchlist(userId, productId);
      return ResponseHandler.sendSuccess(
        res,
        result,
        200,
        "Product added to watchlist"
      );
    }
  }
);

export const getWatchlist = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;

    const watchlist = await userService.getWatchlist(userId);

    return ResponseHandler.sendSuccess<Product[]>(res, watchlist);
  }
);

export const getBiddingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;

    const biddingHistory = await userService.getBiddingHistory(userId);

    return ResponseHandler.sendSuccess<MyAutoBid[]>(res, biddingHistory);
  }
);

export const requestUpgrade = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: userId } = req.user!;
    const { reason } = req.body as UpgradeRequestData;

    const request = await userService.requestUpgradeToSeller(userId, reason);

    return ResponseHandler.sendSuccess<UpgradeRequestResponse>(res, request);
  }
);
