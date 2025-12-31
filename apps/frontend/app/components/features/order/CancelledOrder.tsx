import type { OrderWithDetails } from "@repo/shared-types";
import { XCircle, AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface CancelledOrderProps {
  order: OrderWithDetails;
  isSeller?: boolean;
}

const CancelledOrder = ({ order, isSeller = false }: CancelledOrderProps) => {
  const cancelledDate = order.cancelledAt
    ? new Date(order.cancelledAt).toLocaleDateString("vi-VN")
    : "Không xác định";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng đã bị hủy</CardTitle>
        <CardDescription>
          Thông tin chi tiết về đơn hàng đã được hủy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cancel Status Alert */}
        <Alert className="border-red-300 bg-red-50 text-red-600">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="font-semibold">Đơn hàng đã bị hủy</AlertTitle>
          <AlertDescription className="text-red-600">
            Đơn hàng này đã được hủy vào ngày {cancelledDate}.
            {order.cancelReason && (
              <span className="mt-2 block font-medium">
                Lý do: {order.cancelReason}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Cancellation Details */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Chi tiết hủy đơn</Label>

          <div className="grid gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Ngày hủy</span>
              <span className="text-card-foreground font-medium">
                {formatDate(new Date(order.cancelledAt || new Date()))}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Lý do</span>
              <span className="text-card-foreground font-medium">
                {order.cancelReason || "Không có lý do được cung cấp"}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {!isSeller && (
          <Alert className="border-blue-300 bg-blue-50 text-blue-600">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-semibold">
              Thông tin quan trọng
            </AlertTitle>
            <AlertDescription className="text-blue-600">
              Đơn hàng đã được hủy. Nếu bạn có thắc mắc về lý do hủy hoặc cần
              hoàn tiền, vui lòng liên hệ với người bán hoặc bộ phận hỗ trợ.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CancelledOrder;
