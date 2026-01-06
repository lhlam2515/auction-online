import { z } from "zod";

export const askQuestionSchema = z.object({
  questionContent: z
    .string()
    .min(10, { message: "Câu hỏi phải có ít nhất 10 ký tự" }),
});

export const answerQuestionSchema = z.object({
  answerContent: z
    .string()
    .min(10, { message: "Câu trả lời phải có ít nhất 10 ký tự" }),
});
