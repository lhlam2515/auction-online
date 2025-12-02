import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Product,
  Order,
  GetSellerProductsParams,
  GetSellerOrdersParams,
  PaginatedResponse,
} from "@repo/shared-types";

async function getMyProducts(
  params: GetSellerProductsParams
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    API_ENDPOINTS.seller.products,
    { params }
  );
  return response.data;
}

async function getSellingOrders(
  params: GetSellerOrdersParams
): Promise<PaginatedResponse<Order>> {
  const response = await apiClient.get<PaginatedResponse<Order>>(
    API_ENDPOINTS.order.sellingOrders,
    { params }
  );
  return response.data;
}

export const SellerService = {
  getMyProducts,
  getSellingOrders,
};
