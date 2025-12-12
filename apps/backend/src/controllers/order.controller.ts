import type {
  Order,
  OrderPayment,
  GetOrdersParams,
  UpdateShippingInfoRequest,
  ShipOrderRequest,
  CancelOrderRequest,
  OrderFeedbackRequest,
  MarkPaidRequest,
  PaginatedResponse,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { orderService } from "@/services/order.service";
import { ForbiddenError } from "@/utils/errors";
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

    return ResponseHandler.sendCreated<Order>(res, order);
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

    return ResponseHandler.sendSuccess<PaginatedResponse<Order>>(
      res,
      paginatedOrders
    );
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

    return ResponseHandler.sendSuccess<Order>(res, order);
  }
);

export const updateShippingInfo = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { shippingAddress, phoneNumber } =
      req.body as UpdateShippingInfoRequest;
    const { id: buyerId } = req.user!;

    const updatedOrder = await orderService.updateShippingInfo(
      orderId,
      buyerId,
      shippingAddress,
      phoneNumber
    );

    return ResponseHandler.sendSuccess<Order>(res, updatedOrder);
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

    return ResponseHandler.sendSuccess<{ order: Order; payment: OrderPayment }>(
      res,
      result
    );
  }
);

export const confirmPayment = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { id: sellerId } = req.user!;

    const updatedOrder = await orderService.confirmPayment(orderId, sellerId);

    return ResponseHandler.sendSuccess<Order>(res, updatedOrder);
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

    return ResponseHandler.sendSuccess<Order>(res, updatedOrder);
  }
);

export const receiveOrder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { id: buyerId } = req.user!;

    const updatedOrder = await orderService.receiveOrder(orderId, buyerId);

    return ResponseHandler.sendSuccess<Order>(res, updatedOrder);
  }
);

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { reason } = req.body as CancelOrderRequest;
    const { id: sellerId } = req.user!;

    const updatedOrder = await orderService.cancelOrder(
      orderId,
      sellerId,
      reason
    );

    return ResponseHandler.sendSuccess<Order>(res, updatedOrder);
  }
);

export const leaveFeedback = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id: orderId } = req.params;
    const { rating, comment } = req.body as OrderFeedbackRequest;
    const { id: userId } = req.user!;

    const feedback = await orderService.leaveFeedback(
      orderId,
      userId,
      rating,
      comment
    );

    return ResponseHandler.sendSuccess(res, feedback);
  }
);
