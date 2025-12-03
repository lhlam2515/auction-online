import { Router } from "express";

import * as orderController from "@/controllers/order.controller";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as orderValidation from "@/validations/order.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders (buyer perspective)
 * @access  Private
 */
router.get(
  "/",
  validate({ query: orderValidation.getOrdersSchema }),
  orderController.getMyOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private (buyer or seller)
 */
router.get(
  "/:id",
  validate({ params: orderValidation.orderIdSchema }),
  orderController.getOrderDetails
);

/**
 * @route   POST /api/orders/:id/mark-paid
 * @desc    Buyer confirms payment
 * @access  Private (buyer)
 */
router.post(
  "/:id/mark-paid",
  validate({ params: orderValidation.orderIdSchema }),
  orderController.markAsPaid
);

/**
 * @route   POST /api/orders/:id/payment
 * @desc    Update payment/shipping info
 * @access  Private (buyer)
 */
router.post(
  "/:id/payment",
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.updatePaymentSchema,
  }),
  orderController.updatePaymentInfo
);

/**
 * @route   POST /api/orders/:id/ship
 * @desc    Seller marks order as shipped
 * @access  Private (seller)
 */
router.post(
  "/:id/ship",
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.shipOrderSchema,
  }),
  orderController.shipOrder
);

/**
 * @route   POST /api/orders/:id/receive
 * @desc    Buyer confirms receipt
 * @access  Private (buyer)
 */
router.post(
  "/:id/receive",
  validate({ params: orderValidation.orderIdSchema }),
  orderController.receiveOrder
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (seller)
 */
router.post(
  "/:id/cancel",
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.cancelOrderSchema,
  }),
  orderController.cancelOrder
);

/**
 * @route   POST /api/orders/:id/feedback
 * @desc    Leave feedback after transaction
 * @access  Private (buyer or seller)
 */
router.post(
  "/:id/feedback",
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.feedbackSchema,
  }),
  orderController.leaveFeedback
);

export default router;
