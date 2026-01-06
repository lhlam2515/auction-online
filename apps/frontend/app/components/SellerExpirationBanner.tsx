import { AlertTriangle, Clock } from "lucide-react";

import { useAuth } from "@/contexts/auth-provider";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { formatDate } from "@/lib/utils";

import { AlertSection } from "./common/feedback";

/**
 * Banner component that shows seller expiration warnings
 * Displays when seller account is about to expire or has expired
 */
export function SellerExpirationBanner() {
  const { user } = useAuth();
  const { isExpired, shouldShowWarning, expireDate, daysRemaining } =
    useSellerStatus();

  // Don't show banner if not a seller or if no expiration date
  if (!user || user.role !== "SELLER" || !expireDate) {
    return null;
  }

  if (isExpired) {
    return (
      <AlertSection
        variant="destructive"
        icon={AlertTriangle}
        title="Tài Khoản Người Bán Đã Hết Hạn"
        description={
          <span>
            Tài khoản người bán của bạn đã hết hạn vào ngày{" "}
            {formatDate(expireDate)}. Bạn không thể đăng bán sản phẩm mới cho
            đến khi gia hạn.
          </span>
        }
      />
    );
  }

  if (shouldShowWarning) {
    return (
      <AlertSection
        variant="warning"
        icon={Clock}
        title="Tài Khoản Người Bán Sắp Hết Hạn"
        description={
          <span>
            Tài khoản người bán của bạn sẽ hết hạn vào ngày{" "}
            {formatDate(expireDate)} ({daysRemaining} ngày còn lại). Sau thời
            gian này, bạn sẽ không thể đăng bán sản phẩm mới.
          </span>
        }
      />
    );
  }

  return null;
}
