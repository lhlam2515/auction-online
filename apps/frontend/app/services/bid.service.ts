import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Bid,
  PlaceBidRequest,
  KickBidderRequest,
  CreateAutoBidRequest,
  UpdateAutoBidRequest,
  AutoBid,
  ApiResponse,
} from "@repo/shared-types";

async function getBiddingHistory(
  productId: string
): Promise<ApiResponse<Bid[]>> {
  const response = await apiClient.get<ApiResponse<Bid[]>>(
    API_ENDPOINTS.bid.history(productId)
  );
  return response.data;
}

async function placeBid(
  productId: string,
  data: PlaceBidRequest
): Promise<ApiResponse<Bid>> {
  const response = await apiClient.post<ApiResponse<Bid>>(
    API_ENDPOINTS.bid.placeBid(productId),
    data
  );
  return response.data;
}

async function kickBidder(
  productId: string,
  data: KickBidderRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.bid.kickBidder(productId),
    data
  );
  return response.data;
}

async function createAutoBid(
  productId: string,
  data: CreateAutoBidRequest
): Promise<ApiResponse<AutoBid>> {
  const response = await apiClient.post<ApiResponse<AutoBid>>(
    API_ENDPOINTS.bid.createAutoBid(productId),
    data
  );
  return response.data;
}

async function getAutoBid(productId: string): Promise<ApiResponse<AutoBid>> {
  const response = await apiClient.get<ApiResponse<AutoBid>>(
    API_ENDPOINTS.bid.getAutoBid(productId)
  );
  return response.data;
}

async function updateAutoBid(
  productId: string,
  data: UpdateAutoBidRequest
): Promise<ApiResponse<AutoBid>> {
  const response = await apiClient.put<ApiResponse<AutoBid>>(
    API_ENDPOINTS.bid.getAutoBid(productId),
    data
  );
  return response.data;
}

async function deleteAutoBid(
  productId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.bid.getAutoBid(productId)
  );
  return response.data;
}

export const BidService = {
  getBiddingHistory,
  placeBid,
  kickBidder,
  createAutoBid,
  getAutoBid,
  updateAutoBid,
  deleteAutoBid,
};
