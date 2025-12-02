import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Question,
  AskQuestionRequest,
  AnswerQuestionRequest,
  ApiResponse,
} from "@repo/shared-types";

async function getPublicQuestions(
  productId: string
): Promise<ApiResponse<Question[]>> {
  const response = await apiClient.get<ApiResponse<Question[]>>(
    API_ENDPOINTS.question.public(productId)
  );
  return response.data;
}

async function getPrivateQuestions(
  productId: string
): Promise<ApiResponse<Question[]>> {
  const response = await apiClient.get<ApiResponse<Question[]>>(
    API_ENDPOINTS.question.private(productId)
  );
  return response.data;
}

async function askQuestion(
  productId: string,
  data: AskQuestionRequest
): Promise<ApiResponse<Question>> {
  const response = await apiClient.post<ApiResponse<Question>>(
    API_ENDPOINTS.question.ask(productId),
    data
  );
  return response.data;
}

async function answerQuestion(
  questionId: string,
  data: AnswerQuestionRequest
): Promise<ApiResponse<Question>> {
  const response = await apiClient.post<ApiResponse<Question>>(
    API_ENDPOINTS.question.answer(questionId),
    data
  );
  return response.data;
}

export const QuestionService = {
  getPublicQuestions,
  getPrivateQuestions,
  askQuestion,
  answerQuestion,
};
