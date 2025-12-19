import type { User } from "../user/entities";
import type { RequestStatus } from "../common/enums";

/**
 * Seller profile - user with seller role
 */
export interface SellerProfile extends User {
  // Seller-specific information would be in the user record
  totalSales: number; // Calculated field
  activeListings: number; // Calculated field
  completedOrders: number; // Calculated field
}

/**
 * Seller upgrade request - matches backend upgradeRequests table
 */
export interface SellerUpgradeRequest {
  id: string;
  userId: string;
  reason?: string;
  status: RequestStatus;
  processedBy?: string; // Admin user ID
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

/**
 * Seller dashboard statistics
 */
export interface SellerStats {
  totalActiveProducts: number;
  totalSoldProducts: number;
  totalRevenue: string; // Decimal as string
}
