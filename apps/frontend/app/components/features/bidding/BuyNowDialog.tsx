import type { ProductDetails } from "@repo/shared-types";
import { ShoppingCart, TriangleAlert } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ACCOUNT_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { formatPrice } from "@/lib/utils";

interface BuyNowDialogProps {
  product: ProductDetails;
}

const BuyNowDialog = ({ product }: BuyNowDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleBuyNow = async () => {
    if (!product.buyNowPrice) {
      toast.error("Sản phẩm này không hỗ trợ mua ngay");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để mua sản phẩm");
      return;
    }

    try {
      setIsProcessing(true);

      const response = await api.products.buyNow(product.id);

      if (response.success) {
        toast.success("Đơn hàng đã được tạo thành công!");

        setTimeout(() => {
          navigate(ACCOUNT_ROUTES.ORDER(response.data.newOrderId));
        }, 2000);
      } else {
        throw new Error("Lỗi khi tạo đơn hàng mua ngay");
      }
      setIsOpen(false);
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Có lỗi khi tạo đơn hàng mua ngay"
      );
      showError(error, errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 flex-1 text-lg font-semibold"
        >
          <ShoppingCart className="mr-1 size-5" />
          Mua ngay
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Xác nhận mua ngay
          </DialogTitle>

          <DialogDescription>
            Bạn có chắc chắn muốn mua ngay sản phẩm này không?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="rounded-lg border p-4">
            <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
            <div className="mt-2">
              <span className="text-muted-foreground text-sm font-medium">
                Giá mua ngay:
              </span>
              <p className="text-destructive text-xl font-bold">
                {formatPrice(Number(product.buyNowPrice))}
              </p>
            </div>
          </div>

          {/* Warning */}
          <AlertSection
            variant="warning"
            icon={TriangleAlert}
            description="Sau khi xác nhận mua ngay, bạn sẽ không thể hủy đơn hàng. Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục."
          />

          {/* Action Buttons */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Hủy
            </Button>

            <Button
              variant="destructive"
              onClick={handleBuyNow}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner className="mr-1 h-4 w-4" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  Mua ngay
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNowDialog;
