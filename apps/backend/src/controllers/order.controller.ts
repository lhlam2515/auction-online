import type {
  GetOrdersParams,
  UpdatePaymentRequest,
  ShipOrderRequest,
  CancelOrderRequest,
  OrderFeedbackRequest,
  MarkPaidRequest,
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

export const updatePaymentInfo = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const body = req.body as UpdatePaymentRequest;
    const { id: buyerId } = req.user!;

    const updatedOrder = await orderService.updatePaymentInfo(
      orderId,
      buyerId,
      body.shippingAddress,
      body.phoneNumber
    );

    ResponseHandler.sendSuccess(res, updatedOrder);
  }
);

export const markAsPaid = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { paymentMethod, transactionId, amount } =
      req.body as MarkPaidRequest;
    const { id: buyerId } = req.user!;

    const result = await orderService.markAsPaid(
      orderId,
      buyerId,
      paymentMethod,
      amount,
      transactionId
    );

    ResponseHandler.sendSuccess(res, result);
  }
);

export const shipOrder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { trackingNumber, shippingProvider } = req.body as ShipOrderRequest;
    const { id: sellerId } = req.user!;

    const updatedOrder = await orderService.shipOrder(
      orderId,
      sellerId,
      trackingNumber,
      shippingProvider
    );

    ResponseHandler.sendSuccess(res, updatedOrder);
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
