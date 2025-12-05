import type { Category, GetCategoryProductsParams } from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { categoryService } from "@/services";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get category tree
    const categoriesTree = await categoryService.getTree();
    ResponseHandler.sendSuccess(res, categoriesTree);
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
