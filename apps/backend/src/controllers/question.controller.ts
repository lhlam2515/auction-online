import type {
  AskQuestionRequest,
  AnswerQuestionRequest,
  ProductQuestion,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { questionService } from "@/services";
import { ResponseHandler } from "@/utils/response";

export const getPublicQuestions = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Get public Q&A for product
    const questions = await questionService.getPublicQuestions(req.params.id);
    return ResponseHandler.sendSuccess<ProductQuestion[]>(res, questions);
  }
);

export const askQuestion = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as AskQuestionRequest;
    // Ask a question about product
    const userId = req.user!.id;

    const question = await questionService.askQuestion(
      req.params.id,
      userId,
      body.questionContent
    );
    return ResponseHandler.sendSuccess<ProductQuestion>(res, question);
  }
);

export const answerQuestion = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const body = req.body as AnswerQuestionRequest;
    // Answer a question
    const userId = req.user!.id;

    const answeredQuestion = await questionService.answerQuestion(
      req.params.questionId,
      userId,
      body.answerContent
    );
    return ResponseHandler.sendSuccess<ProductQuestion>(res, answeredQuestion);
  }
);
