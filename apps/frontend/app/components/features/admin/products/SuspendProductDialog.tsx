import type { ProductDetails } from "@repo/shared-types";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

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
          className="cursor-pointer text-red-600 hover:bg-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
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
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Lưu ý!</p>
                <p>
                  Hành động này sẽ gỡ bỏ sản phẩm khỏi hệ thống.
                  <br />
                  Sản phẩm sẽ không thể được tìm thấy và đấu giá sẽ bị dừng.
                </p>
              </div>
            </div>
          </div>

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
