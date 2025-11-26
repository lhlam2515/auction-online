import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middlewares/auth";
import { ResponseHandler } from "@/utils/response";
import { NotImplementedError } from "@/utils/errors";
import { asyncHandler } from "@/middlewares/error-handler";

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get user's orders (buyer perspective)
    throw new NotImplementedError("Get my orders not implemented yet");
  }
);

export const getOrderDetails = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get order details
    throw new NotImplementedError("Get order details not implemented yet");
  }
);

export const markAsPaid = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Buyer confirms payment
    throw new NotImplementedError("Mark as paid not implemented yet");
  }
);

export const updatePaymentInfo = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Update payment/shipping info
    throw new NotImplementedError("Update payment info not implemented yet");
  }
);

export const shipOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Seller marks order as shipped
    throw new NotImplementedError("Ship order not implemented yet");
  }
);

export const receiveOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Buyer confirms receipt
    throw new NotImplementedError("Receive order not implemented yet");
  }
);

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Cancel order
    throw new NotImplementedError("Cancel order not implemented yet");
  }
);

export const leaveFeedback = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Leave feedback after transaction
    throw new NotImplementedError("Leave feedback not implemented yet");
  }
);
