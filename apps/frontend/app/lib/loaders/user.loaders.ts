import type { LoaderFunctionArgs } from "react-router";

/**
 * Get current user profile
 */
export async function profileLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement profile loader
  throw new Error("profileLoader not implemented yet");
}

/**
 * Get public profile of another user
 */
export async function publicProfileLoader({ params }: LoaderFunctionArgs) {
  // TODO: Implement public profile loader
  throw new Error("publicProfileLoader not implemented yet");
}
