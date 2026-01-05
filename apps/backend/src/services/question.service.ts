import type {
  ProductQuestion,
  ProductQuestionWithUsers,
  QuestionStatus,
  QuestionVisibility,
} from "@repo/shared-types";
import { eq, and, aliasedTable, asc } from "drizzle-orm";

import { db } from "@/config/database";
import { productQuestions, users } from "@/models";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";

import { emailService } from "./email.service";
import { productService } from "./product.service";
import { userService } from "./user.service";

export interface QuestionFilters {
  productId?: string;
  askerId?: string;
  answeredBy?: string;
  status?: QuestionStatus;
  visibility?: QuestionVisibility;
}

export class QuestionService {
  async getPublicQuestions(
    productId: string
  ): Promise<ProductQuestionWithUsers[]> {
    // implement public questions retrieval
    const product = await productService.getById(productId);
    const answerer = aliasedTable(users, "answerer");
    const questions = await db
      .select({
        question: productQuestions,
        userName: users.fullName,
        userAvatarUrl: users.avatarUrl,
        answererName: answerer.fullName,
        answererAvatarUrl: answerer.avatarUrl,
      })
      .from(productQuestions)
      .leftJoin(users, eq(productQuestions.userId, users.id))
      .leftJoin(answerer, eq(productQuestions.answeredBy, answerer.id))
      .where(
        and(
          eq(productQuestions.productId, productId),
          eq(productQuestions.isPublic, true)
        )
      )
      .orderBy(asc(productQuestions.createdAt));
    return questions.map((q) => {
      return {
        ...q.question,
        userName: q.userName || "Unknown",
        userAvatarUrl: q.userAvatarUrl,
        // Handle nullable answeredBy - show as null if answerer deleted
        answererName: q.answererName || null,
        answererAvatarUrl: q.answererAvatarUrl || null,
        // Only show answer content if answerer still exists
        answerContent: q.answererName ? q.question.answerContent : null,
      };
    });
  }

  async askQuestion(
    productId: string,
    askerId: string,
    question: string,
    visibility: QuestionVisibility = "PUBLIC"
  ): Promise<ProductQuestion> {
    // implement question creation
    const product = await productService.getById(productId);
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

    // Send email notification to seller
    const seller = await userService.getById(sellerId);
    emailService.notifyNewQuestion(
      seller.email,
      product.name,
      question,
      productService.buildProductLink(productId)
    );

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

    // Send email notification to asker
    const [askers, bidders] = await Promise.all([
      this.getRelatedAskers(question.productId),
      productService.getBidders(question.productId),
    ]);
    const uniqueUsers = new Map<string, (typeof askers)[0]>();
    [...askers, ...bidders].forEach((user) => {
      uniqueUsers.set(user.id, user);
    });

    const emails = Array.from(uniqueUsers.values()).map((user) => user.email);
    emailService.notifySellerReplied(
      emails,
      product.name,
      question.questionContent,
      answerContent,
      productService.buildProductLink(product.id)
    );

    return updatedQuestion;
  }

  private async getRelatedAskers(productId: string) {
    const result = await db.query.productQuestions.findMany({
      where: and(
        eq(productQuestions.productId, productId),
        eq(productQuestions.isPublic, true)
      ),
      with: { user: true },
    });

    return result.map((q) => q.user);
  }
}

export const questionService = new QuestionService();
