import type {
  AskQuestionRequest,
  AnswerQuestionRequest,
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
  NotImplementedError,
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
    // TODO: implement public questions retrieval
    // Should fetch all public Q&A for a product with status ANSWERED
    throw new NotImplementedError("Get public questions not implemented");
  }

  async getPrivateQuestions(
    productId: string,
    sellerId: string
  ): Promise<ProductQuestion[]> {
    // TODO: implement private questions retrieval for seller
    // Should fetch private questions only visible to product seller
    throw new NotImplementedError("Get private questions not implemented");
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
    answer: string
  ): Promise<ProductQuestion> {
    // TODO: implement question answering
    // Should verify answerer owns the product and update status to ANSWERED
    throw new NotImplementedError("Answer question not implemented");
  }

  async getQuestionById(
    questionId: string,
    userId?: string
  ): Promise<ProductQuestion> {
    // TODO: implement get question by ID
    // Should handle privacy rules - private questions only visible to asker/seller
    throw new NotImplementedError("Get question by ID not implemented");
  }

  async deleteQuestion(questionId: string, userId: string): Promise<boolean> {
    // TODO: implement question deletion
    // Should allow deletion by question asker or product seller
    throw new NotImplementedError("Delete question not implemented");
  }

  async getQuestionsByFilters(
    filters: QuestionFilters,
    userId?: string
  ): Promise<ProductQuestion[]> {
    // TODO: implement get questions with filters
    // Should apply visibility rules based on user role
    throw new NotImplementedError("Get questions by filters not implemented");
  }

  async updateQuestionStatus(
    questionId: string,
    status: QuestionStatus,
    userId: string
  ): Promise<ProductQuestion> {
    // TODO: implement question status update
    // Should verify user permissions before updating status
    throw new NotImplementedError("Update question status not implemented");
  }

  async getQuestionsAskedByUser(userId: string): Promise<ProductQuestion[]> {
    // TODO: implement get questions asked by user
    // Should return all questions asked by the user
    throw new NotImplementedError(
      "Get questions asked by user not implemented"
    );
  }

  async getQuestionsForSellerProducts(
    sellerId: string
  ): Promise<ProductQuestion[]> {
    // TODO: implement get questions for seller's products
    // Should return questions for all products owned by seller
    throw new NotImplementedError(
      "Get questions for seller products not implemented"
    );
  }
}

export const questionService = new QuestionService();
