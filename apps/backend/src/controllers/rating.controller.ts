import type {
  CreateRatingRequest,
  GetRatingsParams,
  PaginatedResponse,
  RatingWithUsers,
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
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const query = res.locals.query as GetRatingsParams;

    const result = await ratingService.getByUser(userId, query);

    return ResponseHandler.sendSuccess<PaginatedResponse<RatingWithUsers>>(
      res,
      result
    );
  }
);

export const getRatingSummary = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's rating summary
    throw new NotImplementedError("Get rating summary not implemented yet");
  }
);
