/**
 * Product question entity - matches backend productQuestions table
 */
export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  questionContent: string;
  answerContent?: string;
  answeredBy?: string; // User ID who answered
  isPublic: boolean;
  createdAt: string;
  answeredAt?: string;
}

/**
 * Product question with user information for display
 */
export interface ProductQuestionWithUsers extends ProductQuestion {
  userName: string;
  userAvatarUrl?: string;
  answererName?: string;
  answererAvatarUrl?: string;
  productName: string;
}
