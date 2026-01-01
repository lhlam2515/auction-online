import { AlertCircle } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ACCOUNT_ROUTES, AUTH_ROUTES, SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { formatDate } from "@/lib/utils";

interface ActiveSellerRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires an active (not expired) seller
 * Shows warning message for expired sellers instead of redirecting
 */
export function ActiveSellerRoute({ children }: ActiveSellerRouteProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSeller, isExpired, expireDate } = useSellerStatus();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  // Redirect if not a seller at all
  if (!isSeller) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  // Show expired message if seller account is expired
  if (isExpired) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Alert
          variant="destructive"
          className="mb-6 border-red-300 bg-red-50 text-red-600"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tài Khoản Người Bán Đã Hết Hạn</AlertTitle>
          <AlertDescription>
            Tài khoản người bán của bạn đã hết hạn vào ngày{" "}
            {expireDate ? formatDate(expireDate) : "không xác định"}. Bạn vẫn có
            thể quản lý các sản phẩm và đơn hàng hiện có, nhưng không thể tạo
            sản phẩm mới cho đến khi gia hạn tài khoản người bán.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            onClick={() => {
              navigate(ACCOUNT_ROUTES.UPGRADE);
            }}
          >
            Gia Hạn Tài Khoản Người Bán
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigate(SELLER_ROUTES.DASHBOARD);
            }}
          >
            Đến Trang Quản Lý Người Bán
          </Button>
        </div>
      </div>
    );
  }

  // Seller is active, allow access
  return <>{children}</>;
}
