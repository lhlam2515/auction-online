import type { ActionFunctionArgs } from "react-router";

/**
 * Ship an order action (seller only)
 */
export async function shipOrderAction({ params, request }: ActionFunctionArgs) {
  // TODO: Implement ship order action
  throw new Error("shipOrderAction not implemented yet");
}

/**
 * Cancel order action
 */
export async function cancelOrderAction({
  params,
  request,
}: ActionFunctionArgs) {
  // TODO: Implement cancel order action
  throw new Error("cancelOrderAction not implemented yet");
}
