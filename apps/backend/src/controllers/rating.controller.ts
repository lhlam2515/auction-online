import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";
import type {
  CreateRatingRequest,
  Rating,
  RatingSummary,
} from "@repo/shared-types";

export const createRating = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as CreateRatingRequest;
    // TODO: Submit rating/feedback
    throw new NotImplementedError("Create rating not implemented yet");
  }
);

export const getRatingHistory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's rating history
    throw new NotImplementedError("Get rating history not implemented yet");
  }
);

export const getRatingSummary = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's rating summary
    throw new NotImplementedError("Get rating summary not implemented yet");
  }
);
