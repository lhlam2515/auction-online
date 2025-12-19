import type {
  GetSellerProductsParams,
  GetSellerOrdersParams,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { orderService, productService } from "@/services";
import { toPaginated } from "@/utils/pagination";
import { ResponseHandler } from "@/utils/response";

export const getMyProducts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = res.locals.query as unknown as GetSellerProductsParams;
    // Get seller's products (manage listing)
    const sellerId = req.user!.id;
    const products = await productService.getSellerProducts(sellerId, query);
    ResponseHandler.sendSuccess(res, products);
  }
);

export const getSellingOrders = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = res.locals.query as GetSellerOrdersParams;
    const { id: sellerId } = req.user!;

    const orders = await orderService.getByUser(sellerId, "SELLER", {
      ...query,
    });
    const paginatedOrders = toPaginated(
      orders,
      query.page || 1,
      query.limit || 10,
      orders.length
    );

    ResponseHandler.sendSuccess(res, paginatedOrders);
  }
);
