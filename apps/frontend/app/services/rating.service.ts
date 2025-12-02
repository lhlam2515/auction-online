import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Rating,
  CreateRatingRequest,
  RatingSummary,
  ApiResponse,
} from "@repo/shared-types";

async function createRating(
  data: CreateRatingRequest
): Promise<ApiResponse<Rating>> {
  const response = await apiClient.post<ApiResponse<Rating>>(
    API_ENDPOINTS.rating.create,
    data
  );
  return response.data;
}

async function getRatingHistory(
  userId: string
): Promise<ApiResponse<Rating[]>> {
  const response = await apiClient.get<ApiResponse<Rating[]>>(
    API_ENDPOINTS.rating.list(userId)
  );
  return response.data;
}

async function getRatingSummary(
  userId: string
): Promise<ApiResponse<RatingSummary>> {
  const response = await apiClient.get<ApiResponse<RatingSummary>>(
    API_ENDPOINTS.rating.summary(userId)
  );
  return response.data;
}

export const RatingService = {
  createRating,
  getRatingHistory,
  getRatingSummary,
};
