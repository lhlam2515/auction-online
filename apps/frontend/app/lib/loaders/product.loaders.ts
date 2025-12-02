import type { LoaderFunctionArgs } from "react-router";

/**
 * Search products with filters
 */
export async function searchProductsLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement search products loader
  throw new Error("searchProductsLoader not implemented yet");
}

/**
 * Get top listings (ending soon, hot, new)
 */
export async function topListingsLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement top listings loader
  throw new Error("topListingsLoader not implemented yet");
}

/**
 * Get product details by ID
 */
export async function productDetailsLoader({ params }: LoaderFunctionArgs) {
  // TODO: Implement product details loader
  throw new Error("productDetailsLoader not implemented yet");
}

/**
 * Get related products
 */
export async function relatedProductsLoader({ params }: LoaderFunctionArgs) {
  // TODO: Implement related products loader
  throw new Error("relatedProductsLoader not implemented yet");
}
