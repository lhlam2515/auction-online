import { Router } from "express";

import * as bidController from "@/controllers/bid.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as bidValidation from "@/validations/bid.validation";

const router = Router();

/**
 * @route   GET /api/products/:id/bids
 * @desc    Get bidding history of a product
 * @access  Public
 */
router.get(
  "/:id/bids",
  validate({
    params: bidValidation.productIdSchema,
    query: bidValidation.paginationSchema,
  }),
  bidController.getBiddingHistory
);

/**
 * @route   GET /api/products/:id/bids/seller
 * @desc    Get bidding history of a product
 * @access  Private (User - owner)
 */
router.get(
  "/:id/bids/seller",
  authenticate,
  validate({
    params: bidValidation.productIdSchema,
    query: bidValidation.paginationSchema,
  }),
  bidController.getBiddingHistoryForSeller
);

/**
 * @route   POST /api/products/:id/bids
 * @desc    Place a bid on product
 * @access  Private (Bidder)
 */
router.post(
  "/:id/bids",
  authenticate,
  authorize("BIDDER", "SELLER"),
  validate({
    params: bidValidation.productIdSchema,
    body: bidValidation.placeBidSchema,
  }),
  bidController.placeBid
);

/**
 * @route   POST /api/products/:id/kick
 * @desc    Kick a bidder from product
 * @access  Private (Seller - owner)
 */
router.post(
  "/:id/kick",
  authenticate,
  authorize("SELLER"),
  validate({
    params: bidValidation.productIdSchema,
    body: bidValidation.kickBidderSchema,
  }),
  bidController.kickBidder
);

/**
 * @route   POST /api/products/:id/auto-bid
 * @desc    Create auto-bid configuration
 * @access  Private (Bidder)
 */
router.post(
  "/:id/auto-bid",
  authenticate,
  authorize("BIDDER", "SELLER"),
  validate({
    params: bidValidation.productIdSchema,
    body: bidValidation.autoBidSchema,
  }),
  bidController.createAutoBid
);

/**
 * @route   GET /api/products/:id/auto-bid
 * @desc    Get user's auto-bid for product
 * @access  Private (Bidder)
 */
router.get(
  "/:id/auto-bid",
  authenticate,
  authorize("BIDDER", "SELLER"),
  validate({ params: bidValidation.productIdSchema }),
  bidController.getAutoBid
);

/**
 * @route   PUT /api/products/auto-bid/:id
 * @desc    Update auto-bid configuration
 * @access  Private (Bidder - owner)
 */
router.put(
  "/auto-bid/:id",
  authenticate,
  authorize("BIDDER", "SELLER"),
  validate({
    params: bidValidation.autoBidIdSchema,
    body: bidValidation.updateAutoBidSchema,
  }),
  bidController.updateAutoBid
);

/**
 * @route   DELETE /api/products/auto-bid/:id
 * @desc    Delete auto-bid configuration
 * @access  Private (Bidder - owner)
 */
router.delete(
  "/auto-bid/:id",
  authenticate,
  authorize("BIDDER", "SELLER"),
  validate({ params: bidValidation.autoBidIdSchema }),
  bidController.deleteAutoBid
);

export default router;
