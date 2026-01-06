import type {
  ProductQuestion,
  ProductQuestionWithUsers,
  QuestionVisibility,
} from "@repo/shared-types";
import { eq, and, isNull, desc } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { productQuestions, users, products, autoBids } from "@/models";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";

import { emailService } from "./email.service";
import { productService } from "./product.service";

export class QuestionService {
  async getPublicQuestions(
    productId: string
  ): Promise<ProductQuestionWithUsers[]> {
    const questions = await db.query.productQuestions.findMany({
      where: and(
        eq(productQuestions.productId, productId),
        eq(productQuestions.isPublic, true)
      ),
      with: {
        asker: { columns: { fullName: true, avatarUrl: true } },
        answerer: { columns: { fullName: true, avatarUrl: true } },
      },
      orderBy: desc(productQuestions.createdAt),
    });

    return questions.map((question) => {
      const { asker, answerer, ...rest } = question;
      return {
        ...rest,
        userName: asker?.fullName ?? "Unknown",
        userAvatarUrl: asker?.avatarUrl ?? null,
        answererName: answerer?.fullName ?? null,
        answererAvatarUrl: answerer?.avatarUrl ?? null,
        answerContent: question.answeredBy ? question.answerContent : null,
      };
    });
  }

  async askQuestion(
    productId: string,
    askerId: string,
    question: string,
    visibility: QuestionVisibility = "PUBLIC"
  ): Promise<ProductQuestion> {
    const productInfo = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true, sellerId: true, name: true },
    });

    if (!productInfo) throw new NotFoundError("Không tìm thấy sản phẩm");
    if (!productInfo.sellerId)
      throw new BadRequestError("Không tìm thấy người bán");

    if (askerId === productInfo.sellerId) {
      throw new BadRequestError(
        "Người bán không thể đặt câu hỏi cho sản phẩm của chính họ"
      );
    }

    const [newQuestion] = await db
      .insert(productQuestions)
      .values({
        productId,
        userId: askerId,
        questionContent: question,
        isPublic: visibility === "PUBLIC",
        createdAt: new Date(),
      })
      .returning();

    this.handleQuestionNotification(
      productInfo.sellerId,
      productId,
      productInfo.name,
      question
    );

    return newQuestion;
  }

  async answerQuestion(
    questionId: string,
    answeredBy: string,
    answerContent: string
  ): Promise<ProductQuestion> {
    return await db.transaction(async (tx) => {
      const question = await tx.query.productQuestions.findFirst({
        where: eq(productQuestions.id, questionId),
        with: {
          product: { columns: { sellerId: true, name: true, id: true } },
        },
      });

      if (!question) throw new NotFoundError("Không tìm thấy câu hỏi");
      if (!question.product)
        throw new NotFoundError(
          "Không tìm thấy sản phẩm liên quan đến câu hỏi"
        );

      if (question.product.sellerId !== answeredBy) {
        throw new UnauthorizedError("Chỉ người bán mới có thể trả lời câu hỏi");
      }

      const [updatedQuestion] = await tx
        .update(productQuestions)
        .set({
          answerContent,
          answeredBy,
          answeredAt: new Date(),
        })
        .where(
          and(
            eq(productQuestions.id, questionId),
            isNull(productQuestions.answeredBy)
          )
        )
        .returning();

      if (!updatedQuestion) {
        throw new BadRequestError(
          "Câu hỏi đã được trả lời trước đó, không thể trả lời lại"
        );
      }

      this.handleAnswerNotification(
        question.productId,
        question.product.name,
        question.questionContent,
        answerContent
      );

      return updatedQuestion;
    });
  }

  private async handleQuestionNotification(
    sellerId: string,
    productId: string,
    productName: string,
    questionContent: string
  ) {
    try {
      const sellerInfo = await db.query.users.findFirst({
        where: eq(users.id, sellerId),
        columns: { email: true },
      });

      if (sellerInfo && sellerInfo.email) {
        await emailService.notifyNewQuestion(
          sellerInfo.email,
          productName,
          questionContent,
          productService.buildProductLink(productId)
        );
      }
    } catch (err) {
      logger.error("Failed to send question notification email:", err);
    }
  }

  private async handleAnswerNotification(
    productId: string,
    productName: string,
    questionContent: string,
    answerContent: string
  ) {
    try {
      const [askers, bidders] = await Promise.all([
        db.query.productQuestions
          .findMany({
            where: and(
              eq(productQuestions.productId, productId),
              eq(productQuestions.isPublic, true)
            ),
            with: { asker: { columns: { email: true } } },
          })
          .then((questions) =>
            questions.map((q) => q.asker).filter((u) => u.email)
          ),
        db.query.autoBids
          .findMany({
            where: and(
              eq(autoBids.productId, productId),
              eq(autoBids.isActive, true)
            ),
            with: { user: { columns: { email: true } } },
          })
          .then((bids) => bids.map((b) => b.user).filter((u) => u.email)),
      ]);

      const emails = new Set<string>();
      askers.forEach((a) => emails.add(a.email));
      bidders.forEach((b) => emails.add(b.email));

      if (emails.size > 0) {
        await emailService.notifySellerReplied(
          Array.from(emails),
          productName,
          questionContent,
          answerContent,
          productService.buildProductLink(productId)
        );
      }
    } catch (err) {
      logger.error("Failed to send answer notification email:", err);
    }
  }
}

export const questionService = new QuestionService();
