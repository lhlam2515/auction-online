import type { LoaderFunctionArgs } from "react-router";
import { BidService } from "@/services";

/**
 * Get user's bid history
 */
export async function myBidsLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement after backend adds getMyBids endpoint
  throw new Response("getMyBids endpoint not available yet", { status: 501 });
}

/**
 * Get winning bids for the user
 */
export async function winningBidsLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement after backend adds getWinningBids endpoint
  throw new Response("getWinningBids endpoint not available yet", {
    status: 501,
  });
}
