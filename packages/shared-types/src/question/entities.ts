import type { QuestionStatus, QuestionVisibility } from "./enums";

/**
 * Question entity
 */
export interface Question {
  id: string;
  productId: string;
  askerId: string;
  askerName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  answeredAt?: string;
  status: QuestionStatus;
  visibility: QuestionVisibility;
  createdAt: string;
  updatedAt: string;
}
