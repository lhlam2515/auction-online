import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpgradeRequestData,
  RatingSummary,
  ApiResponse,
} from "@repo/shared-types";

async function getProfile(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(
    API_ENDPOINTS.user.profile
  );
  return response.data;
}

async function updateProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse<User>> {
  const response = await apiClient.put<ApiResponse<User>>(
    API_ENDPOINTS.user.profile,
    data
  );
  return response.data;
}

async function changePassword(
  data: ChangePasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.patch<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.user.changePassword,
    data
  );
  return response.data;
}

async function getPublicProfile(userId: string): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(
    API_ENDPOINTS.user.publicProfile(userId)
  );
  return response.data;
}

async function getRatingSummary(
  userId: string
): Promise<ApiResponse<RatingSummary>> {
  const response = await apiClient.get<ApiResponse<RatingSummary>>(
    API_ENDPOINTS.user.ratingSummary(userId)
  );
  return response.data;
}

async function addToWatchlist(
  productId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.user.toggleWatchlist(productId)
  );
  return response.data;
}

async function removeFromWatchlist(
  productId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.user.toggleWatchlist(productId)
  );
  return response.data;
}

async function getWatchlist(): Promise<ApiResponse<string[]>> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    API_ENDPOINTS.user.watchlist
  );
  return response.data;
}

async function getBiddingHistory(): Promise<ApiResponse<unknown[]>> {
  const response = await apiClient.get<ApiResponse<unknown[]>>(
    API_ENDPOINTS.user.bids
  );
  return response.data;
}

async function requestUpgrade(
  data: UpgradeRequestData
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.user.upgradeRequest,
    data
  );
  return response.data;
}

export const UserService = {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  getRatingSummary,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  getBiddingHistory,
  requestUpgrade,
};
