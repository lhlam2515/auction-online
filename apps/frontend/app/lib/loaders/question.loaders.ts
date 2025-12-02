import type { LoaderFunctionArgs } from "react-router";

/**
 * Get public questions for a product
 */
export async function productQuestionsLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  // TODO: Implement product questions loader
  throw new Error("productQuestionsLoader not implemented yet");
}

/**
 * Get private questions for a product (seller only)
 */
export async function privateQuestionsLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  // TODO: Implement private questions loader
  throw new Error("privateQuestionsLoader not implemented yet");
}
