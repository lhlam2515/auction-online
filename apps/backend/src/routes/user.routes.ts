import { Router } from "express";

import * as analyticsController from "@/controllers/analytics.controller";
import * as userController from "@/controllers/user.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { uploadMiddleware } from "@/middlewares/upload";
import { validate } from "@/middlewares/validate";
import * as analyticsValidation from "@/validations/analytics.validation";
import * as userValidation from "@/validations/user.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  "/profile",
  uploadMiddleware.single("avatar"),
  validate({ body: userValidation.updateProfileSchema }),
  userController.updateProfile
);

/**
 * @route   PATCH /api/users/password
 * @desc    Change password
 * @access  Private
 */
router.patch(
  "/password",
  validate({ body: userValidation.changePasswordSchema }),
  userController.changePassword
);

/**
 * @route   GET /api/users/:id/public-profile
 * @desc    Get public profile of another user
 * @access  Private
 */
router.get(
  "/:id/public-profile",
  validate({ params: userValidation.userIdSchema }),
  userController.getPublicProfile
);

/**
 * @route   GET /api/users/:id/rating-summary
 * @desc    Get user rating summary
 * @access  Private
 */
router.get(
  "/:id/rating-summary",
  validate({ params: userValidation.userIdSchema }),
  userController.getRatingSummary
);

/**
 * @route   POST /api/users/watchlist/:productId
 * @desc    Add/Remove product from watchlist
 * @access  Private
 */
router.post(
  "/watchlist/:productId",
  validate({ params: userValidation.productIdSchema }),
  userController.toggleWatchlist
);

/**
 * @route   GET /api/users/watchlist
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get("/watchlist", userController.getWatchlist);

/**
 * @route   GET /api/users/bids
 * @desc    Get user's bidding history
 * @access  Private
 */
router.get(
  "/bids",
  validate({ query: userValidation.paginationSchema }),
  userController.getBiddingHistory
);

/**
 * @route   GET /api/users/stats
 * @desc    Get bidder dashboard statistics
 * @access  Private
 */
router.get("/stats", userController.getBidderStats);

/**
 * @route   GET /api/users/analytics/spending
 * @desc    Get bidder spending analytics for charts
 * @access  Private (Bidder)
 * @query   period - Time period: 7d, 30d, or 12m (default: 30d)
 */
router.get(
  "/analytics/spending",
  authorize("BIDDER"),
  validate({ query: analyticsValidation.analyticsPeriodSchema }),
  analyticsController.getBidderSpending
);

/**
 * @route   POST /api/users/upgrade-request
 * @desc    Request upgrade to Seller role
 * @access  Private (Bidder)
 */
router.post(
  "/upgrade-request",
  authorize("BIDDER"),
  validate({ body: userValidation.upgradeRequestSchema }),
  userController.requestUpgrade
);

export default router;
