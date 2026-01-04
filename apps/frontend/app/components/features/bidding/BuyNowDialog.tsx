import type { ProductDetails } from "@repo/shared-types";
import { ShoppingCart, TriangleAlert, X } from "lucide-react";
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
import { ACCOUNT_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
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
        throw new Error("Failed to buy product");
      }
    } catch (error) {
      logger.error("Error buying product:", error);
      toast.error("Có lỗi xảy ra khi mua sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="border-accent text-accent hover:bg-accent flex h-14 flex-1 cursor-pointer gap-2 bg-transparent text-lg font-semibold hover:text-white"
        >
          <ShoppingCart className="h-4 w-4" />
          Mua ngay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
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
            <div className="flex gap-4">
              <div className="flex-1">
                <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
                <div className="mt-2">
                  <span className="text-muted-foreground text-sm">
                    Giá mua ngay:
                  </span>
                  <p className="text-xl font-bold text-red-600">
                    {formatPrice(Number(product.buyNowPrice))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <AlertSection
            variant="warning"
            icon={TriangleAlert}
            description={
              <>
                Sau khi xác nhận mua ngay, bạn sẽ không thể hủy đơn hàng. Vui
                lòng kiểm tra kỹ thông tin trước khi tiếp tục.
              </>
            }
          />

          {/* Action Buttons */}
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleBuyNow}
              disabled={isProcessing}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isProcessing ? "Đang xử lý..." : "Xác nhận mua ngay"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNowDialog;
