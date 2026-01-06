import { useMemo } from "react";

import { useAuth } from "@/contexts/auth-provider";
import {
  hasSellerRole,
  hasActiveSellerRole,
  isSellerExpired,
  getDaysUntilExpiration,
  shouldShowExpirationWarning,
} from "@/lib/auth-utils";

export interface SellerStatus {
  isSeller: boolean;
  isActive: boolean;
  isExpired: boolean;
  expireDate: Date | null;
  daysRemaining: number | null;
  shouldShowWarning: boolean;
}

/**
 * Hook to check seller status and expiration
 * @returns SellerStatus object with detailed seller information
 */
export function useSellerStatus(): SellerStatus {
  const { user } = useAuth();

  return useMemo(() => {
    const isSeller = hasSellerRole(user);
    const isActive = hasActiveSellerRole(user);
    const expired = isSellerExpired(user);
    const expireDate = user?.sellerExpireDate
      ? new Date(user.sellerExpireDate)
      : null;
    const daysRemaining = getDaysUntilExpiration(user);
    const showWarning = shouldShowExpirationWarning(user);

    return {
      isSeller,
      isActive,
      isExpired: expired,
      expireDate,
      daysRemaining,
      shouldShowWarning: showWarning,
    };
  }, [user]);
}
