import type {
  ProductQuestion,
  QuestionStatus,
  QuestionVisibility,
} from "@repo/shared-types";
import { eq, and } from "drizzle-orm";

import { db } from "@/config/database";
import { productQuestions } from "@/models";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";

import { productService } from "./product.service";

export interface QuestionFilters {
  productId?: string;
  askerId?: string;
  answeredBy?: string;
  status?: QuestionStatus;
  visibility?: QuestionVisibility;
}

export class QuestionService {
  async getPublicQuestions(productId: string): Promise<ProductQuestion[]> {
    // implement public questions retrieval
    const questions = await db
      .select()
      .from(productQuestions)
      .where(
        and(
          eq(productQuestions.productId, productId),
          eq(productQuestions.isPublic, true)
        )
      );
    return questions;
  }

  async askQuestion(
    productId: string,
    askerId: string,
    question: string,
    visibility: QuestionVisibility = "PUBLIC"
  ): Promise<ProductQuestion> {
    // implement question creation
    const product = await productService.getById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const sellerId = product.sellerId;
    if (askerId === sellerId) {
      throw new BadRequestError("Seller cannot ask question on own product");
    }

    const [newQuestion] = await db
      .insert(productQuestions)
      .values({
        productId: productId,
        userId: askerId,
        questionContent: question,
        isPublic: visibility === "PUBLIC",
        createdAt: new Date(),
      })
      .returning();

    // TODO: sent email notification to seller

    return newQuestion;
  }

  async answerQuestion(
    questionId: string,
    answeredBy: string,
    answerContent: string
  ): Promise<ProductQuestion> {
    // implement question answering
    const question = await db.query.productQuestions.findFirst({
      where: eq(productQuestions.id, questionId),
    });
    if (!question) {
      throw new NotFoundError("Question");
    }

    if (question.answeredBy) {
      throw new BadRequestError("Question already answered");
    }

    const product = await productService.getById(question.productId);
    if (product.sellerId !== answeredBy) {
      throw new UnauthorizedError(
        "Only product seller can answer the question"
      );
    }

    const [updatedQuestion] = await db
      .update(productQuestions)
      .set({
        answerContent: answerContent,
        answeredBy: answeredBy,
        answeredAt: new Date(),
      })
      .where(eq(productQuestions.id, questionId))
      .returning();

    // TODO: send email notification to asker

    return updatedQuestion;
  }
}

export const questionService = new QuestionService();
