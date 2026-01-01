import { useMemo } from "react";

import { useAuth } from "@/contexts/auth-provider";

export interface SellerStatus {
  isSeller: boolean;
  isActive: boolean;
  isExpired: boolean;
  expireDate: Date | null;
  daysRemaining: number | null;
  shouldShowWarning: boolean; // Show warning if < 3 days remaining
}

/**
 * Hook to check seller status and expiration
 * @returns SellerStatus object with detailed seller information
 */
export function useSellerStatus(): SellerStatus {
  const { user } = useAuth();

  return useMemo(() => {
    // Not a seller
    if (!user || user.role !== "SELLER") {
      return {
        isSeller: false,
        isActive: false,
        isExpired: false,
        expireDate: null,
        daysRemaining: null,
        shouldShowWarning: false,
      };
    }

    // No expiration date means unlimited access
    if (!user.sellerExpireDate) {
      return {
        isSeller: true,
        isActive: true,
        isExpired: false,
        expireDate: null,
        daysRemaining: null,
        shouldShowWarning: false,
      };
    }

    const now = new Date();
    const expireDate = new Date(user.sellerExpireDate);
    const isExpired = expireDate <= now;
    const isActive = !isExpired;

    let daysRemaining: number | null = null;
    let shouldShowWarning = false;

    if (isActive) {
      const diffTime = expireDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      shouldShowWarning = daysRemaining < 3;
    }

    return {
      isSeller: true,
      isActive,
      isExpired,
      expireDate,
      daysRemaining,
      shouldShowWarning,
    };
  }, [user]);
}
