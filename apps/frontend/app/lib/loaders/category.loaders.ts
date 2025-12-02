import type { LoaderFunctionArgs } from "react-router";
import { CategoryService } from "@/services";

/**
 * Get all categories
 */
export async function categoriesLoader() {
  try {
    const response = await CategoryService.getCategories();
    return Response.json(response);
  } catch (error) {
    throw new Response("Failed to fetch categories", { status: 500 });
  }
}

/**
 * Get category by ID
 */
export async function categoryLoader({ params }: LoaderFunctionArgs) {
  // TODO: Implement after backend adds getCategoryById endpoint
  // For now, use getCategories and filter client-side if needed
  throw new Response("getCategoryById endpoint not available yet", {
    status: 501,
  });
}

/**
 * Get products in a category
 */
export async function categoryProductsLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  const { categoryId } = params;

  if (!categoryId) {
    throw new Response("Category ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const queryParams = {
    page: parseInt(url.searchParams.get("page") || "1"),
    limit: parseInt(url.searchParams.get("limit") || "20"),
    sortBy: url.searchParams.get("sortBy") || undefined,
    sortOrder: url.searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    minPrice: url.searchParams.get("minPrice")
      ? parseFloat(url.searchParams.get("minPrice")!)
      : undefined,
    maxPrice: url.searchParams.get("maxPrice")
      ? parseFloat(url.searchParams.get("maxPrice")!)
      : undefined,
  };

  try {
    const response = await CategoryService.getProductsByCategory(
      categoryId,
      queryParams
    );
    return Response.json(response);
  } catch (error) {
    throw new Response("Failed to fetch category products", { status: 500 });
  }
}
