import { AlertCircle } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ACCOUNT_ROUTES, AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import {
  hasSellerRole,
  isSellerExpired,
  canAccessSellerPages,
} from "@/lib/auth-utils";
import { formatDate } from "@/lib/utils";

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
  const hasActiveProducts = user?.hasActiveProducts ?? false;

  if (!isSeller) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  if (requireActive && expired) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Alert
          variant="destructive"
          className="mb-6 border-red-300 bg-red-50 text-red-600"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tài Khoản Người Bán Đã Hết Hạn</AlertTitle>
          <AlertDescription>
            Tài khoản người bán của bạn đã hết hạn vào lúc{" "}
            {user?.sellerExpireDate
              ? formatDate(user.sellerExpireDate)
              : "không xác định"}
            . Bạn cần gia hạn tài khoản để thực hiện chức năng này.
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
              navigate(-1);
            }}
          >
            Quay Lại
          </Button>
        </div>
      </div>
    );
  }

  if (expired && !hasActiveProducts) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  if (!canAccessSellerPages(user, hasActiveProducts)) {
    return <Navigate to={ACCOUNT_ROUTES.UPGRADE} replace />;
  }

  return <>{children}</>;
}
