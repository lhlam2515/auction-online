import type { Response } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { analyticsService } from "@/services/analytics.service";

/**
 * Get bidder spending analytics
 * GET /users/analytics/spending?period=30d
 */
export const getBidderSpending = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: userId } = req.user!;
    const { period } = res.locals.query;

    const analytics = await analyticsService.getBidderSpending(userId, period);

    res.json({
      success: true,
      data: analytics,
    });
  }
);

/**
 * Get seller revenue analytics
 * GET /seller/analytics/revenue?period=30d
 */
export const getSellerRevenue = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: userId } = req.user!;
    const { period } = res.locals.query;

    const analytics = await analyticsService.getSellerRevenue(userId, period);

    res.json({
      success: true,
      data: analytics,
    });
  }
);
