import type { ProductDetails } from "@repo/shared-types";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

import { AlertSection } from "@/components/common/feedback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type SuspendProductDialogProps = {
  product: ProductDetails;
  onSuspend: (productId: string) => Promise<void>;
};

const SuspendProductDialog = ({
  product,
  onSuspend,
}: SuspendProductDialogProps) => {
  const [isSuspending, setIsSuspending] = useState(false);

  const handleSuspend = async () => {
    setIsSuspending(true);
    try {
      await onSuspend(product.id);
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Gỡ bỏ
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận gỡ bỏ sản phẩm
          </AlertDialogTitle>
          <p>
            Bạn có chắc chắn muốn gỡ bỏ sản phẩm <b>{product.name}</b>?
          </p>
        </AlertDialogHeader>

        <div className="space-y-3">
          <AlertSection
            variant="warning"
            icon={AlertTriangle}
            title="Lưu ý"
            description="Hành động này sẽ gỡ bỏ sản phẩm khỏi hệ thống. Sản phẩm sẽ không thể được tìm thấy và đấu giá sẽ bị dừng."
          />
          <p className="text-sm">Hành động này không thể hoàn tác.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSuspending} className="cursor-pointer">
            Hủy
          </AlertDialogCancel>
          <Button variant="destructive" asChild>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={isSuspending}
              className="cursor-pointer"
            >
              {isSuspending ? (
                "Đang gỡ bỏ..."
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Gỡ bỏ sản phẩm
                </>
              )}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendProductDialog;
