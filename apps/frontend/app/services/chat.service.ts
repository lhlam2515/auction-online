import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  ChatMessage,
  SendMessageRequest,
  UnreadCountResponse,
  ApiResponse,
} from "@repo/shared-types";

async function getChatHistory(
  orderId: string
): Promise<ApiResponse<ChatMessage[]>> {
  const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
    API_ENDPOINTS.chat.history(orderId)
  );
  return response.data;
}

async function sendMessage(
  orderId: string,
  data: SendMessageRequest
): Promise<ApiResponse<ChatMessage>> {
  const response = await apiClient.post<ApiResponse<ChatMessage>>(
    API_ENDPOINTS.chat.sendMessage(orderId),
    data
  );
  return response.data;
}

async function markAsRead(
  orderId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.chat.markRead(orderId)
  );
  return response.data;
}

async function getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
  const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
    API_ENDPOINTS.chat.unreadCount
  );
  return response.data;
}

export const ChatService = {
  getChatHistory,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
