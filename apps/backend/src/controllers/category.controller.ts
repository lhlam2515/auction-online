import type {
  Product,
  CategoryTree,
  GetCategoryProductsParams,
  PaginatedResponse,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { categoryService } from "@/services";
import { ResponseHandler } from "@/utils/response";

export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Get category tree
    const categoriesTree = await categoryService.getTree();
    ResponseHandler.sendSuccess<CategoryTree[]>(res, categoriesTree);
  }
);

export const getProductsByCategory = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = res.locals.query as unknown as GetCategoryProductsParams;
    // Get products in a category
    const products = await categoryService.getProductsByCategory(
      req.params.id,
      query
    );
    ResponseHandler.sendSuccess<PaginatedResponse<Product>>(res, products);
  }
);
