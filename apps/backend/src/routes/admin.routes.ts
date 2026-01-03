import { Router } from "express";

import * as adminController from "@/controllers/admin.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as adminValidation from "@/validations/admin.validation";

const router = Router();

// All routes require Admin authentication
router.use(authenticate, authorize("ADMIN"));

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get("/stats", adminController.getDashboardStats);

/**
 * Analytics Endpoints
 */

/**
 * @route   GET /api/admin/analytics
 * @desc    Get comprehensive analytics data (all metrics)
 * @access  Private (Admin)
 */
router.get("/analytics", adminController.getFullAnalytics);

/**
 * @route   GET /api/admin/analytics/categories
 * @desc    Get category insights (GMV by category, top categories)
 * @access  Private (Admin)
 */
router.get("/analytics/categories", adminController.getCategoryInsights);

/**
 * @route   GET /api/admin/analytics/auction-health
 * @desc    Get auction health metrics (success rate, bid density)
 * @access  Private (Admin)
 */
router.get("/analytics/auction-health", adminController.getAuctionHealth);

/**
 * @route   GET /api/admin/analytics/operations
 * @desc    Get operations metrics (seller funnel, transaction pipeline)
 * @access  Private (Admin)
 */
router.get("/analytics/operations", adminController.getOperationsMetrics);

/**
 * @route   GET /api/admin/analytics/engagement
 * @desc    Get engagement metrics (reputation distribution, bidding activity)
 * @access  Private (Admin)
 */
router.get("/analytics/engagement", adminController.getEngagementMetrics);

/**
 * User Management
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters and pagination
 * @access  Private (Admin)
 */
router.get(
  "/users",
  validate({ query: adminValidation.getUsersSchema }),
  adminController.getUsers
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details by ID
 * @access  Private (Admin)
 */
router.get(
  "/users/:id",
  validate({ params: adminValidation.userIdSchema }),
  adminController.getUserById
);

/**
 * @route   PATCH /api/admin/users/:id/ban
 * @desc    Ban/unban user
 * @access  Private (Admin)
 */
router.patch(
  "/users/:id/ban",
  validate({
    params: adminValidation.userIdSchema,
    body: adminValidation.banUserSchema,
  }),
  adminController.toggleBanUser
);

/**
 * @route   POST /api/admin/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Admin)
 */
router.post(
  "/users/:id/reset-password",
  validate({ params: adminValidation.userIdSchema }),
  adminController.resetUserPassword
);

/**
 * @route   GET /api/admin/upgrades
 * @desc    Get upgrade requests
 * @access  Private (Admin)
 */
router.get(
  "/upgrades",
  validate({ query: adminValidation.getUpgradesSchema }),
  adminController.getUpgradeRequests
);

/**
 * @route   POST /api/admin/upgrades/:id/approve
 * @desc    Approve upgrade request
 * @access  Private (Admin)
 */
router.post(
  "/upgrades/:id/approve",
  validate({
    params: adminValidation.upgradeIdSchema,
    body: adminValidation.processUpgradeSchema,
  }),
  adminController.approveUpgrade
);

/**
 * @route   POST /api/admin/upgrades/:id/reject
 * @desc    Reject upgrade request
 * @access  Private (Admin)
 */
router.post(
  "/upgrades/:id/reject",
  validate({
    params: adminValidation.upgradeIdSchema,
    body: adminValidation.processUpgradeSchema,
  }),
  adminController.rejectUpgrade
);

/**
 * @route   GET /api/admin/products
 * @desc    Get all products
 * @access  Private (Admin)
 */
router.get(
  "/products",
  validate({ query: adminValidation.getProductsSchema }),
  adminController.getAllProducts
);

/**
 * @route   GET /api/admin/products/pending
 * @desc    Get pending products
 * @access  Private (Admin)
 */
router.get(
  "/products/pending",
  validate({ query: adminValidation.paginationSchema }),
  adminController.getPendingProducts
);

/**
 * @route   PUT /api/admin/products/:id/approve
 * @desc    Approve product
 * @access  Private (Admin)
 */
router.put(
  "/products/:id/approve",
  validate({ params: adminValidation.productIdSchema }),
  adminController.approveProduct
);

/**
 * @route   PUT /api/admin/products/:id/reject
 * @desc    Reject product
 * @access  Private (Admin)
 */
router.put(
  "/products/:id/reject",
  validate({
    params: adminValidation.productIdSchema,
    body: adminValidation.rejectProductSchema,
  }),
  adminController.rejectProduct
);

/**
 * @route   POST /api/admin/products/:id/suspend
 * @desc    Suspend active product
 * @access  Private (Admin)
 */
router.post(
  "/products/:id/suspend",
  validate({
    params: adminValidation.productIdSchema,
  }),
  adminController.suspendProduct
);

/**
 * @route   POST /api/admin/categories
 * @desc    Create category
 * @access  Private (Admin)
 */
router.post(
  "/categories",
  validate({ body: adminValidation.createCategorySchema }),
  adminController.createCategory
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put(
  "/categories/:id",
  validate({
    params: adminValidation.categoryIdSchema,
    body: adminValidation.updateCategorySchema,
  }),
  adminController.updateCategory
);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete(
  "/categories/:id",
  validate({ params: adminValidation.categoryIdSchema }),
  adminController.deleteCategory
);

export default router;
