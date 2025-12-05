import type {
  AskQuestionRequest,
  AnswerQuestionRequest,
  ProductQuestion,
} from "@repo/shared-types";
import { Response, NextFunction } from "express";

import { AuthRequest } from "@/middlewares/auth";
import { asyncHandler } from "@/middlewares/error-handler";
import { NotImplementedError } from "@/utils/errors";
import { ResponseHandler } from "@/utils/response";

export const getPublicQuestions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Get public Q&A for product
    throw new NotImplementedError("Get public questions not implemented yet");
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
    // TODO: Ask a question about product
    throw new NotImplementedError("Ask question not implemented yet");
  }
);

export const answerQuestion = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const body = req.body as AnswerQuestionRequest;
    // TODO: Answer a question
    throw new NotImplementedError("Answer question not implemented yet");
  }
);
