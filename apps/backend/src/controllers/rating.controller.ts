import type {
  CreateRatingRequest,
  Rating,
  RatingSummary,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { ratingService } from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const createRating = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as CreateRatingRequest;
    // TODO: Submit rating/feedback
    throw new NotImplementedError("Create rating not implemented yet");
  }
);

export const getRatingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query as never;

    const result = await ratingService.getByUser(userId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    return ResponseHandler.sendSuccess(res, result);
  }
);

export const getRatingSummary = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's rating summary
    throw new NotImplementedError("Get rating summary not implemented yet");
  }
);
