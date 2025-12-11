/**
 * Upgrade request response
 */
export interface UpgradeRequestResponse {
  id: string;
  userId: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  processedBy: string | null;
  processedAt: Date | null;
  adminNote: string | null;
  createdAt: Date;
}
