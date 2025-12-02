import type { User } from "../user/entities";
import type { ProductStatus } from "../product/enums";
import type { OrderStatus } from "../order/enums";

/**
 * Seller profile extending user
 */
export interface SellerProfile extends User {
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  sellerRating: number;
  totalSales: number;
  activeListings: number;
  completedOrders: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
}

/**
 * Seller dashboard stats
 */
export interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  viewsThisMonth: number;
  salesThisMonth: number;
}
