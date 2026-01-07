import { Router } from "express";

import * as orderController from "@/controllers/order.controller";
import { authenticate, authorize } from "@/middlewares/auth";
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
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.markPaidSchema,
  }),
  orderController.markAsPaid
);

/**
 * @route   POST /api/orders/:id/payment
 * @desc    Buyer updates shipping info
 * @access  Private (buyer)
 */
router.post(
  "/:id/shipping",
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.updateShippingInfoSchema,
  }),
  orderController.updateShippingInfo
);

/**
 * @route   POST /api/orders/:id/confirm-payment
 * @desc    Seller confirms payment received
 * @access  Private (seller, includes expired)
 */
router.post(
  "/:id/confirm-payment",
  authorize("SELLER"),
  validate({
    params: orderValidation.orderIdSchema,
  }),
  orderController.confirmPayment
);

/**
 * @route   POST /api/orders/:id/ship
 * @desc    Seller marks order as shipped
 * @access  Private (seller, includes expired)
 */
router.post(
  "/:id/ship",
  authorize("SELLER"),
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
 * @access  Private (seller, includes expired)
 */
router.post(
  "/:id/cancel",
  authorize("SELLER"),
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.cancelOrderSchema,
  }),
  orderController.cancelOrder
);

/**
 * @route  GET /api/orders/:id/feedback
 * @desc   Get feedback for a specific order
 * @access Private (buyer or seller)
 */
router.get(
  "/:id/feedback",
  validate({ params: orderValidation.orderIdSchema }),
  orderController.getOrderFeedbacks
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

/**
 * @route   PUT /api/orders/:id/feedback
 * @desc    Edit feedback after transaction
 * @access  Private (buyer or seller)
 */
router.put(
  "/:id/feedback",
  validate({
    params: orderValidation.orderIdSchema,
    body: orderValidation.feedbackSchema,
  }),
  orderController.editFeedback
);

export default router;
