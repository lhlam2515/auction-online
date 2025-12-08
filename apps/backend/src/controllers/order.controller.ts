import type {
  GetOrdersParams,
  UpdatePaymentRequest,
  ShipOrderRequest,
  CancelOrderRequest,
  OrderFeedbackRequest,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { orderService } from "@/services/order.service";
import { ForbiddenError, NotImplementedError } from "@/utils/errors";
import { toPaginated } from "@/utils/pagination";
import { ResponseHandler } from "@/utils/response";

export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { productId, winnerId, sellerId, finalPrice } = req.body;

    const order = await orderService.createFromAuction(
      productId,
      winnerId,
      sellerId,
      finalPrice,
      true // buyNow flag
    );

    ResponseHandler.sendCreated(res, order);
  }
);

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = res.locals.query as GetOrdersParams;
    const { id: userId } = req.user!;

    const orders = await orderService.getByUser(userId, "BIDDER", {
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

export const getOrderDetails = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;

    const order = await orderService.getById(orderId);

    if (
      order.winner.email !== req.user!.email &&
      order.seller.email !== req.user!.email
    ) {
      throw new ForbiddenError("Access to this order is denied");
    }

    ResponseHandler.sendSuccess(res, order);
  }
);

export const markAsPaid = asyncHandler(
  async (_req: AuthRequest, _res: Response, _next: NextFunction) => {
    // TODO: Buyer confirms payment
    throw new NotImplementedError("Mark as paid not implemented yet");
  }
);

export const updatePaymentInfo = asyncHandler(
  async (req: AuthRequest, _res: Response, _next: NextFunction) => {
    const body = req.body as UpdatePaymentRequest;
    // TODO: Update payment/shipping info
    throw new NotImplementedError("Update payment info not implemented yet");
  }
);

export const shipOrder = asyncHandler(
  async (req: AuthRequest, _res: Response, _next: NextFunction) => {
    const body = req.body as ShipOrderRequest;
    // TODO: Seller marks order as shipped
    throw new NotImplementedError("Ship order not implemented yet");
  }
);

export const receiveOrder = asyncHandler(
  async (_req: AuthRequest, _res: Response, _next: NextFunction) => {
    // TODO: Buyer confirms receipt
    throw new NotImplementedError("Receive order not implemented yet");
  }
);

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, _res: Response, _next: NextFunction) => {
    const body = req.body as CancelOrderRequest;
    // TODO: Cancel order
    throw new NotImplementedError("Cancel order not implemented yet");
  }
);

export const leaveFeedback = asyncHandler(
  async (req: AuthRequest, _res: Response, _next: NextFunction) => {
    const body = req.body as OrderFeedbackRequest;
    // TODO: Leave feedback for order
    throw new NotImplementedError("Leave feedback not implemented yet");
  }
);
