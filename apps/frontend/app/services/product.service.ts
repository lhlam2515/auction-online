import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  Product,
  CreateProductRequest,
  UpdateDescriptionRequest,
  AutoExtendRequest,
  SearchProductsParams,
  TopListingParams,
  TopListingResponse,
  UploadImagesResponse,
  DescriptionUpdate,
  PaginatedResponse,
  ApiResponse,
} from "@repo/shared-types";

async function searchProducts(
  params: SearchProductsParams
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    API_ENDPOINTS.product.search,
    { params }
  );
  return response.data;
}

async function getTopListings(
  params: TopListingParams
): Promise<ApiResponse<TopListingResponse>> {
  const response = await apiClient.get<ApiResponse<TopListingResponse>>(
    API_ENDPOINTS.product.topListing,
    { params }
  );
  return response.data;
}

async function getProductById(
  productId: string
): Promise<ApiResponse<Product>> {
  const response = await apiClient.get<ApiResponse<Product>>(
    API_ENDPOINTS.product.detail(productId)
  );
  return response.data;
}

async function getProductImages(
  productId: string
): Promise<ApiResponse<string[]>> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    API_ENDPOINTS.product.images(productId)
  );
  return response.data;
}

async function getRelatedProducts(
  productId: string
): Promise<ApiResponse<Product[]>> {
  const response = await apiClient.get<ApiResponse<Product[]>>(
    API_ENDPOINTS.product.related(productId)
  );
  return response.data;
}

async function getDescriptionUpdates(
  productId: string
): Promise<ApiResponse<DescriptionUpdate[]>> {
  const response = await apiClient.get<ApiResponse<DescriptionUpdate[]>>(
    API_ENDPOINTS.product.descriptionUpdates(productId)
  );
  return response.data;
}

async function createProduct(
  data: CreateProductRequest
): Promise<ApiResponse<Product>> {
  const response = await apiClient.post<ApiResponse<Product>>(
    API_ENDPOINTS.product.create,
    data
  );
  return response.data;
}

async function updateDescription(
  productId: string,
  data: UpdateDescriptionRequest
): Promise<ApiResponse<Product>> {
  const response = await apiClient.put<ApiResponse<Product>>(
    API_ENDPOINTS.product.updateDescription(productId),
    data
  );
  return response.data;
}

async function toggleAutoExtend(
  productId: string,
  data: AutoExtendRequest
): Promise<ApiResponse<Product>> {
  const response = await apiClient.patch<ApiResponse<Product>>(
    API_ENDPOINTS.product.toggleAutoExtend(productId),
    data
  );
  return response.data;
}

async function uploadImages(
  productId: string,
  images: FormData
): Promise<ApiResponse<UploadImagesResponse>> {
  const response = await apiClient.post<ApiResponse<UploadImagesResponse>>(
    API_ENDPOINTS.product.images(productId),
    images,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

async function deleteProduct(
  productId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.product.delete(productId)
  );
  return response.data;
}

export const ProductService = {
  searchProducts,
  getTopListings,
  getProductById,
  getProductImages,
  getRelatedProducts,
  getDescriptionUpdates,
  createProduct,
  updateDescription,
  toggleAutoExtend,
  uploadImages,
  deleteProduct,
};
