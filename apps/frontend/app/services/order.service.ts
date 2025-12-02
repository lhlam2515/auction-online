import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Order,
  GetOrdersParams,
  UpdatePaymentRequest,
  ShipOrderRequest,
  CancelOrderRequest,
  OrderFeedbackRequest,
  PaginatedResponse,
  ApiResponse,
} from "@repo/shared-types";

async function getMyOrders(
  params: GetOrdersParams
): Promise<PaginatedResponse<Order>> {
  const response = await apiClient.get<PaginatedResponse<Order>>(
    API_ENDPOINTS.order.list,
    { params }
  );
  return response.data;
}

async function getOrderDetails(orderId: string): Promise<ApiResponse<Order>> {
  const response = await apiClient.get<ApiResponse<Order>>(
    API_ENDPOINTS.order.detail(orderId)
  );
  return response.data;
}

async function updatePaymentInfo(
  orderId: string,
  data: UpdatePaymentRequest
): Promise<ApiResponse<Order>> {
  const response = await apiClient.put<ApiResponse<Order>>(
    API_ENDPOINTS.order.updatePayment(orderId),
    data
  );
  return response.data;
}

async function shipOrder(
  orderId: string,
  data: ShipOrderRequest
): Promise<ApiResponse<Order>> {
  const response = await apiClient.post<ApiResponse<Order>>(
    API_ENDPOINTS.order.ship(orderId),
    data
  );
  return response.data;
}

async function cancelOrder(
  orderId: string,
  data: CancelOrderRequest
): Promise<ApiResponse<Order>> {
  const response = await apiClient.post<ApiResponse<Order>>(
    API_ENDPOINTS.order.cancel(orderId),
    data
  );
  return response.data;
}

async function leaveFeedback(
  orderId: string,
  data: OrderFeedbackRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.order.feedback(orderId),
    data
  );
  return response.data;
}

export const OrderService = {
  getMyOrders,
  getOrderDetails,
  updatePaymentInfo,
  shipOrder,
  cancelOrder,
  leaveFeedback,
};
