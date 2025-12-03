import { Router } from "express";

import * as ratingController from "@/controllers/rating.controller";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as ratingValidation from "@/validations/rating.validation";

const router = Router();

/**
 * @route   POST /api/ratings
 * @desc    Submit rating/feedback
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validate({ body: ratingValidation.createRatingSchema }),
  ratingController.createRating
);

/**
 * @route   GET /api/ratings/:userId
 * @desc    Get user's rating history
 * @access  Public
 */
router.get(
  "/:userId",
  validate({
    params: ratingValidation.userIdSchema,
    query: ratingValidation.paginationSchema,
  }),
  ratingController.getRatingHistory
);

/**
 * @route   GET /api/ratings/:userId/summary
 * @desc    Get user's rating summary
 * @access  Public
 */
router.get(
  "/:userId/summary",
  validate({ params: ratingValidation.userIdSchema }),
  ratingController.getRatingSummary
);

export default router;
