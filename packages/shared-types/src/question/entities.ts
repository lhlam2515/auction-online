/**
 * Product question entity - matches backend productQuestions table
 */
export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  questionContent: string;
  answerContent: string | null;
  answeredBy: string | null; // User ID who answered
  isPublic: boolean;
  createdAt: Date | string;
  answeredAt: Date | string | null;
}

/**
 * Product question with user information for display
 */
export interface ProductQuestionWithUsers extends ProductQuestion {
  userName: string;
  userAvatarUrl: string | null;
  answererName: string | null;
  answererAvatarUrl: string | null;
}
