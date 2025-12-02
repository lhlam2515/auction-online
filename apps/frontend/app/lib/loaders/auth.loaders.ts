import type { LoaderFunctionArgs } from "react-router";

/**
 * Get current authenticated user
 */
export async function currentUserLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement current user loader
  throw new Error("currentUserLoader not implemented yet");
}

/**
 * Check if user is already authenticated
 */
export async function guestOnlyLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement guest only loader
  throw new Error("guestOnlyLoader not implemented yet");
}

/**
 * Verify email token loader
 */
export async function verifyEmailLoader({ request }: LoaderFunctionArgs) {
  // TODO: Implement verify email loader
  throw new Error("verifyEmailLoader not implemented yet");
}
