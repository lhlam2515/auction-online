import { Router } from "express";
import * as categoryController from "@/controllers/category.controller";
import { validate } from "@/middlewares/validate";
import * as categoryValidation from "@/validations/category.validation";

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get category tree
 * @access  Public
 */
router.get("/", categoryController.getCategories);

/**
 * @route   GET /api/categories/:id/products
 * @desc    Get products in a category
 * @access  Public
 */
router.get(
  "/:id/products",
  validate({
    params: categoryValidation.categoryIdSchema,
    query: categoryValidation.getProductsSchema,
  }),
  categoryController.getProductsByCategory
);

export default router;
