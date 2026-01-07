import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { SELLER_ROUTES } from "@/constants/routes";
import { useSellerStatus } from "@/hooks/useSellerStatus";

interface CreateProductButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Button component for creating new products
 * - Disabled if user is not authenticated, not a seller, or seller account is expired
 * - Navigates to create product page only if seller is active
 */
const CreateProductButton = ({
  variant = "default",
  size = "default",
  className,
}: CreateProductButtonProps) => {
  const sellerStatus = useSellerStatus();
  const navigate = useNavigate();

  const handleClick = () => {
    // Only allow creation if seller is active
    if (sellerStatus.isActive) {
      navigate(SELLER_ROUTES.PRODUCT_CREATE);
    }
  };

  const isDisabled = !sellerStatus.isActive;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <PlusCircle className="mr-1 h-4 w-4" />
      Tạo Sản Phẩm
    </Button>
  );
};

export default CreateProductButton;
