import type { OrderWithDetails } from "@repo/shared-types";
import { XCircle, AlertCircle } from "lucide-react";

import { AlertSection } from "@/components/common/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface OrderCancelledCardProps {
  order: OrderWithDetails;
  isSeller?: boolean;
}

const OrderCancelledCard = ({
  order,
  isSeller = false,
}: OrderCancelledCardProps) => {
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
        <AlertSection
          variant="destructive"
          icon={XCircle}
          title="Đơn hàng đã bị hủy"
          description={`Đơn hàng này đã được hủy vào ngày ${cancelledDate}.`}
        />

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
          <AlertSection
            variant="info"
            icon={AlertCircle}
            title="Thông tin quan trọng"
            description="Đơn hàng đã được hủy. Nếu bạn có thắc mắc về lý do hủy hoặc cần hoàn tiền, vui lòng liên hệ với người bán hoặc bộ phận hỗ trợ."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCancelledCard;
