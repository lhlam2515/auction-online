import type { LoaderFunctionArgs } from "react-router";

/**
 * Get user's orders (as buyer)
 */
export async function myOrdersLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement my orders loader
  throw new Error("myOrdersLoader not implemented yet");
}

/**
 * Get order details by ID
 */
export async function orderDetailsLoader({ params }: LoaderFunctionArgs) {
  // TODO: Implement order details loader
  throw new Error("orderDetailsLoader not implemented yet");
}
