import type {
  AskQuestionRequest,
  AnswerQuestionRequest,
  ProductQuestion,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { questionService } from "@/services";
import { BadRequestError, NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getPublicQuestions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get public Q&A for product
    const questions = await questionService.getPublicQuestions(req.params.id);
    return ResponseHandler.sendSuccess<ProductQuestion[]>(res, questions);
  }
);

export const getPrivateQuestions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get private questions (seller only)
    throw new NotImplementedError("Get private questions not implemented yet");
  }
);

export const askQuestion = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as AskQuestionRequest;
    // Ask a question about product
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("Asker ID is required");
    }

    const question = await questionService.askQuestion(
      req.params.id,
      userId,
      body.questionContent
    );
    return ResponseHandler.sendSuccess<ProductQuestion>(res, question);
  }
);

export const answerQuestion = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as AnswerQuestionRequest;
    // TODO: Answer a question
    throw new NotImplementedError("Answer question not implemented yet");
  }
);
