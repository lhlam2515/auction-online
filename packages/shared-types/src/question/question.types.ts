/**
 * Product question entity
 */
export interface Question {
  id: string;
  productId: string;
  askerId: string;
  askerName: string;
  questionContent: string;
  answerContent?: string;
  answeredAt?: string;
  isPublic: boolean;
  createdAt: string;
}

/**
 * Ask question request
 * Backend validation: question.validation.ts → askQuestionSchema
 */
export interface AskQuestionRequest {
  questionContent: string;
  isPublic?: boolean;
}

/**
 * Answer question request
 * Backend validation: question.validation.ts → answerQuestionSchema
 */
export interface AnswerQuestionRequest {
  answerContent: string;
}
