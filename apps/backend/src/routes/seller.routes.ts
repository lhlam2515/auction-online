import { Router } from "express";

import * as analyticsController from "@/controllers/analytics.controller";
import * as sellerController from "@/controllers/seller.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as analyticsValidation from "@/validations/analytics.validation";
import * as sellerValidation from "@/validations/seller.validation";

const router = Router();

// All routes require Seller authentication
router.use(authenticate, authorize("SELLER"));

/**
 * @route   GET /api/seller/stats
 * @desc    Get seller dashboard statistics
 * @access  Private (Seller)
 */
router.get("/stats", sellerController.getStats);

/**
 * @route   GET /api/seller/analytics/revenue
 * @desc    Get seller revenue analytics for charts
 * @access  Private (Seller)
 * @query   period - Time period: 7d, 30d, or 12m (default: 30d)
 */
router.get(
  "/analytics/revenue",
  validate({ query: analyticsValidation.analyticsPeriodSchema }),
  analyticsController.getSellerRevenue
);

/**
 * @route   GET /api/seller/products
 * @desc    Get seller's products (manage listing)
 * @access  Private (Seller)
 */
router.get(
  "/products",
  validate({ query: sellerValidation.getProductsSchema }),
  sellerController.getMyProducts
);

/**
 * @route   GET /api/seller/selling-orders
 * @desc    Get seller's orders
 * @access  Private (Seller)
 */
router.get(
  "/selling-orders",
  validate({ query: sellerValidation.getOrdersSchema }),
  sellerController.getSellingOrders
);

export default router;
