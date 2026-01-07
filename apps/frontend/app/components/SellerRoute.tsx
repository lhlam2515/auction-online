import { AlertCircle } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { ACCOUNT_ROUTES, AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import {
  hasSellerRole,
  isSellerExpired,
  isTemporarySeller,
  hasActiveSellerRole,
} from "@/lib/auth-utils";
import { formatDate } from "@/lib/utils";

import { AlertSection } from "./common/feedback";

interface SellerRouteProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

/**
 * Seller Route - specialized route for seller pages
 *
 * @param requireActive - If true, only active (non-expired) sellers can access
 */
export function SellerRoute({
  children,
  requireActive = false,
}: SellerRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  const isSeller = hasSellerRole(user);
  const expired = isSellerExpired(user);
  const temporary = isTemporarySeller(user);

  if (!isSeller) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  // For pages that require active seller (like create product)
  if (requireActive) {
    // Only active sellers can create products
    if (!hasActiveSellerRole(user)) {
      return (
        <div className="container mx-auto max-w-2xl py-12">
          <AlertSection
            variant="destructive"
            icon={AlertCircle}
            title={
              temporary
                ? "Người Bán Tạm Thời Không Thể Tạo Sản Phẩm Mới"
                : "Tài Khoản Người Bán Đã Hết Hạn"
            }
            description={
              temporary
                ? "Bạn đang ở trạng thái người bán tạm thời. Bạn có thể quản lý các sản phẩm và đơn hàng hiện có, nhưng không thể tạo sản phẩm mới. Vui lòng gia hạn tài khoản để tạo sản phẩm mới."
                : `Tài khoản người bán của bạn đã hết hạn vào lúc ${
                    user?.sellerExpireDate
                      ? formatDate(user.sellerExpireDate)
                      : "không xác định"
                  }. Bạn cần gia hạn tài khoản để thực hiện chức năng này.`
            }
          />

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                navigate(ACCOUNT_ROUTES.UPGRADE);
              }}
            >
              Gia Hạn Tài Khoản Người Bán
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate(-1);
              }}
            >
              Quay Lại
            </Button>
          </div>
        </div>
      );
    }
  }

  // For general seller pages (not requiring active status)
  if (expired && !temporary) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  if (expired && temporary) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  return <>{children}</>;
}
