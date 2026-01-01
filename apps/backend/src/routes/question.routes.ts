import { Router } from "express";

import * as questionController from "@/controllers/question.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as questionValidation from "@/validations/question.validation";

const router = Router();

/**
 * @route   GET /api/products/:id/questions
 * @desc    Get public Q&A for product
 * @access  Public
 */
router.get(
  "/:id/questions",
  validate({ params: questionValidation.productIdSchema }),
  questionController.getPublicQuestions
);

/**
 * @route   POST /api/products/:id/questions
 * @desc    Ask a question about product
 * @access  Private (Bidder)
 */
router.post(
  "/:id/questions",
  authenticate,
  authorize("BIDDER", "SELLER"),
  validate({
    params: questionValidation.productIdSchema,
    body: questionValidation.askQuestionSchema,
  }),
  questionController.askQuestion
);

/**
 * @route   POST /api/questions/:questionId/answer
 * @desc    Answer a question
 * @access  Private (Seller - owner, includes expired)
 */
router.post(
  "/questions/:questionId/answer",
  authenticate,
  authorize("SELLER"),
  validate({
    params: questionValidation.questionIdSchema,
    body: questionValidation.answerQuestionSchema,
  }),
  questionController.answerQuestion
);

export default router;
