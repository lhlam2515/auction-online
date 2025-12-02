import type { QuestionVisibility } from "./enums";

/**
 * Ask question request
 * Backend validation: question.validation.ts → askQuestionSchema
 */
export interface AskQuestionRequest {
  question: string;
  isPrivate?: boolean;
  visibility?: QuestionVisibility;
}

/**
 * Answer question request
 * Backend validation: question.validation.ts → answerQuestionSchema
 */
export interface AnswerQuestionRequest {
  answer: string;
}
