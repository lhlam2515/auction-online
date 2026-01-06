import type { UserAuthData } from "@repo/shared-types";

/**
 * Check if user has bidder role
 */
export function hasBidderRole(user: UserAuthData | null): boolean {
  return user?.role === "BIDDER";
}

/**
 * Check if user has seller role (regardless of expiration status)
 */
export function hasSellerRole(user: UserAuthData | null): boolean {
  return user?.role === "SELLER";
}

/**
 * Check if user has admin role
 */
export function hasAdminRole(user: UserAuthData | null): boolean {
  return user?.role === "ADMIN";
}

/**
 * Check if user has specific role(s)
 */
export function hasRole(
  user: UserAuthData | null,
  roles: Array<UserAuthData["role"]>
): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if seller account is active (not expired)
 */
export function hasActiveSellerRole(user: UserAuthData | null): boolean {
  if (!hasSellerRole(user)) return false;

  if (!user?.sellerExpireDate) return true;

  const expireDate = new Date(user.sellerExpireDate);
  const now = new Date();

  return expireDate > now;
}

/**
 * Check if seller account is expired
 */
export function isSellerExpired(user: UserAuthData | null): boolean {
  if (!hasSellerRole(user)) return false;

  if (!user?.sellerExpireDate) return false;

  const expireDate = new Date(user.sellerExpireDate);
  const now = new Date();

  return expireDate <= now;
}

/**
 * Check if user is a temporary seller
 * Temporary seller = expired seller with active products AND incomplete orders
 */
export function isTemporarySeller(user: UserAuthData | null): boolean {
  return user?.isTemporarySeller === true;
}

/**
 * Check if user can access seller pages
 * Sellers with expired accounts can still access if they have products
 */
export function canAccessSellerPages(user: UserAuthData | null): boolean {
  if (!hasSellerRole(user)) return false;

  if (hasActiveSellerRole(user)) return true;

  return isTemporarySeller(user);
}

/**
 * Get days remaining until seller expiration
 * Returns null if no expiration date or if already expired
 */
export function getDaysUntilExpiration(
  user: UserAuthData | null
): number | null {
  if (!hasSellerRole(user) || !user?.sellerExpireDate) return null;

  const expireDate = new Date(user.sellerExpireDate);
  const now = new Date();

  if (expireDate <= now) return null;

  const diffTime = expireDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if seller expiration warning should be shown
 * Shows warning if seller expires in 3 days or less
 */
export function shouldShowExpirationWarning(
  user: UserAuthData | null
): boolean {
  const daysRemaining = getDaysUntilExpiration(user);
  return daysRemaining !== null && daysRemaining <= 3;
}
