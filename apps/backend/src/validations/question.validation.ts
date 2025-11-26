import { z } from "zod";

export const productIdSchema = z.object({
  id: z.uuid({ error: "Invalid product ID" }),
});

export const questionIdSchema = z.object({
  questionId: z.uuid({ error: "Invalid question ID" }),
});

export const askQuestionSchema = z.object({
  questionContent: z
    .string()
    .min(10, { error: "Question must be at least 10 characters" }),
  isPublic: z.boolean().default(true),
});

export const answerQuestionSchema = z.object({
  answerContent: z
    .string()
    .min(5, { error: "Answer must be at least 5 characters" }),
});
