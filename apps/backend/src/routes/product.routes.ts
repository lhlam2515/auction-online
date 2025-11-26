import { Router } from "express";
import * as productController from "@/controllers/product.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as productValidation from "@/validations/product.validation";

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Search and filter products
 * @access  Public
 */
router.get(
  "/",
  validate({ query: productValidation.searchProductsSchema }),
  productController.searchProducts
);

/**
 * @route   GET /api/products/top-listing
 * @desc    Get top products (ending soon, hot, new)
 * @access  Public
 */
router.get(
  "/top-listing",
  validate({ query: productValidation.topListingSchema }),
  productController.getTopListing
);

/**
 * @route   GET /api/products/:id
 * @desc    Get product details
 * @access  Public
 */
router.get(
  "/:id",
  validate({ params: productValidation.productIdSchema }),
  productController.getProductDetails
);

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get(
  "/:id/related",
  validate({ params: productValidation.productIdSchema }),
  productController.getRelatedProducts
);

/**
 * @route   GET /api/products/:id/images
 * @desc    Get product images
 * @access  Public
 */
router.get(
  "/:id/images",
  validate({ params: productValidation.productIdSchema }),
  productController.getProductImages
);

/**
 * @route   GET /api/products/:id/description-updates
 * @desc    Get product description update history
 * @access  Public
 */
router.get(
  "/:id/description-updates",
  validate({ params: productValidation.productIdSchema }),
  productController.getDescriptionUpdates
);

/**
 * @route   POST /api/products
 * @desc    Create new product listing
 * @access  Private (Seller)
 */
router.post(
  "/",
  authenticate,
  authorize("SELLER"),
  validate({ body: productValidation.createProductSchema }),
  productController.createProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (only if not active)
 * @access  Private (Seller - owner)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("SELLER"),
  validate({ params: productValidation.productIdSchema }),
  productController.deleteProduct
);

/**
 * @route   PATCH /api/products/:id/description
 * @desc    Update product description (append mode)
 * @access  Private (Seller - owner)
 */
router.patch(
  "/:id/description",
  authenticate,
  authorize("SELLER"),
  validate({
    params: productValidation.productIdSchema,
    body: productValidation.updateDescriptionSchema,
  }),
  productController.updateDescription
);

/**
 * @route   PUT /api/products/:id/auto-extend
 * @desc    Toggle auto-extend setting
 * @access  Private (Seller - owner)
 */
router.put(
  "/:id/auto-extend",
  authenticate,
  authorize("SELLER"),
  validate({
    params: productValidation.productIdSchema,
    body: productValidation.autoExtendSchema,
  }),
  productController.toggleAutoExtend
);

/**
 * @route   POST /api/upload
 * @desc    Upload product images
 * @access  Private (Seller)
 */
router.post(
  "/upload",
  authenticate,
  authorize("SELLER"),
  productController.uploadImages
);

export default router;
