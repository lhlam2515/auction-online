import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";
import type { Category, GetCategoryProductsParams } from "@repo/shared-types";

export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get category tree
    throw new NotImplementedError("Get categories not implemented yet");
  }
);

export const getProductsByCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetCategoryProductsParams;
    // TODO: Get products in a category
    throw new NotImplementedError(
      "Get products by category not implemented yet"
    );
  }
);
