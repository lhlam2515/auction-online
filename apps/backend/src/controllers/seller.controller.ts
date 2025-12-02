import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";
import type {
  GetSellerProductsParams,
  GetSellerOrdersParams,
} from "@repo/shared-types";

export const getMyProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetSellerProductsParams;
    // TODO: Get seller's products (manage listing)
    throw new NotImplementedError("Get my products not implemented yet");
  }
);

export const getSellingOrders = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetSellerOrdersParams;
    // TODO: Get seller's orders
    throw new NotImplementedError("Get selling orders not implemented yet");
  }
);
