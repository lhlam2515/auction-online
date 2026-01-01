import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ACCOUNT_ROUTES, AUTH_ROUTES, SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { useSellerStatus } from "@/hooks/useSellerStatus";

interface CreateProductButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Button component for creating new products
 * - Redirects to upgrade page if not a seller
 * - Shows error toast if seller is expired
 * - Navigates to create product page if seller is active
 */
export function CreateProductButton({
  variant = "default",
  size = "default",
  className,
}: CreateProductButtonProps) {
  const { isAuthenticated } = useAuth();
  const sellerStatus = useSellerStatus();
  const navigate = useNavigate();

  const handleClick = () => {
    // Not logged in
    if (!isAuthenticated) {
      navigate(AUTH_ROUTES.LOGIN);
      return;
    }

    // Not a seller
    if (!sellerStatus.isSeller) {
      navigate(ACCOUNT_ROUTES.UPGRADE);
      return;
    }

    // Expired seller
    if (sellerStatus.isExpired) {
      toast.error(
        "Tài khoản người bán của bạn đã hết hạn. Vui lòng gia hạn để tạo sản phẩm.",
        {
          action: {
            label: "Gia Hạn",
            onClick: () => navigate(ACCOUNT_ROUTES.UPGRADE),
          },
        }
      );
      return;
    }

    // Active seller - proceed to create
    navigate(SELLER_ROUTES.PRODUCT_CREATE);
  };

  const isDisabled = sellerStatus.isSeller && sellerStatus.isExpired;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      Tạo Sản Phẩm
    </Button>
  );
}
