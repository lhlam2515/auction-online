import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/handlers/api";
import type {
  AdminStats,
  AdminUser,
  GetUsersParams,
  BanUserRequest,
  ResetUserPasswordRequest,
  UpgradeRequest,
  GetUpgradeRequestsParams,
  ProcessUpgradeRequest,
  Product,
  GetProductsParams,
  RejectProductRequest,
  SuspendProductRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
  ApiResponse,
} from "@repo/shared-types";

async function getDashboardStats(): Promise<ApiResponse<AdminStats>> {
  const response = await apiClient.get<ApiResponse<AdminStats>>(
    API_ENDPOINTS.admin.stats
  );
  return response.data;
}

async function getUsers(
  params: GetUsersParams
): Promise<PaginatedResponse<AdminUser>> {
  const response = await apiClient.get<PaginatedResponse<AdminUser>>(
    API_ENDPOINTS.admin.users,
    { params }
  );
  return response.data;
}

async function toggleBanUser(
  userId: string,
  data: BanUserRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.banUser(userId),
    data
  );
  return response.data;
}

async function resetUserPassword(
  userId: string,
  data: ResetUserPasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.resetUserPassword(userId),
    data
  );
  return response.data;
}

async function getUpgradeRequests(
  params: GetUpgradeRequestsParams
): Promise<PaginatedResponse<UpgradeRequest>> {
  const response = await apiClient.get<PaginatedResponse<UpgradeRequest>>(
    API_ENDPOINTS.admin.upgrades,
    { params }
  );
  return response.data;
}

async function approveUpgrade(
  requestId: string,
  data: ProcessUpgradeRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.approveUpgrade(requestId),
    data
  );
  return response.data;
}

async function rejectUpgrade(
  requestId: string,
  data: ProcessUpgradeRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.rejectUpgrade(requestId),
    data
  );
  return response.data;
}

async function getAllProducts(
  params: GetProductsParams
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    API_ENDPOINTS.admin.products,
    { params }
  );
  return response.data;
}

async function getPendingProducts(
  params: GetProductsParams
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    API_ENDPOINTS.admin.pendingProducts,
    { params }
  );
  return response.data;
}

async function approveProduct(
  productId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.approveProduct(productId)
  );
  return response.data;
}

async function rejectProduct(
  productId: string,
  data: RejectProductRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.rejectProduct(productId),
    data
  );
  return response.data;
}

async function suspendProduct(
  productId: string,
  data: SuspendProductRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.suspendProduct(productId),
    data
  );
  return response.data;
}

async function createCategory(
  data: CreateCategoryRequest
): Promise<ApiResponse<Category>> {
  const response = await apiClient.post<ApiResponse<Category>>(
    API_ENDPOINTS.admin.createCategory,
    data
  );
  return response.data;
}

async function updateCategory(
  categoryId: string,
  data: UpdateCategoryRequest
): Promise<ApiResponse<Category>> {
  const response = await apiClient.put<ApiResponse<Category>>(
    API_ENDPOINTS.admin.updateCategory(categoryId),
    data
  );
  return response.data;
}

async function deleteCategory(
  categoryId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.admin.deleteCategory(categoryId)
  );
  return response.data;
}

export const AdminService = {
  getDashboardStats,
  getUsers,
  toggleBanUser,
  resetUserPassword,
  getUpgradeRequests,
  approveUpgrade,
  rejectUpgrade,
  getAllProducts,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  suspendProduct,
  createCategory,
  updateCategory,
  deleteCategory,
};
