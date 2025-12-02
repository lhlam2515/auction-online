import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Category,
  GetCategoryProductsParams,
  Product,
  PaginatedResponse,
  ApiResponse,
} from "@repo/shared-types";

async function getCategories(): Promise<ApiResponse<Category[]>> {
  const response = await apiClient.get<ApiResponse<Category[]>>(
    API_ENDPOINTS.category.list
  );
  return response.data;
}

async function getProductsByCategory(
  categoryId: string,
  params: GetCategoryProductsParams
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    API_ENDPOINTS.category.products(categoryId),
    { params }
  );
  return response.data;
}

export const CategoryService = {
  getCategories,
  getProductsByCategory,
};
