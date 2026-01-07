import type { OrderWithDetails } from "@repo/shared-types";
import { Clock, CheckCircle2, Package, AlertCircle, Info } from "lucide-react";

import { AlertSection } from "@/components/common/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

import { OrderTimelineItem, ShippingInfo } from "../shared";

interface BuyerAwaitingStepProps {
  order: OrderWithDetails;
}

const BuyerAwaitingStep = ({ order }: BuyerAwaitingStepProps) => {
  const paidAt = order.payment?.paidAt
    ? new Date(order.payment.paidAt)
    : new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chờ người bán xác nhận</CardTitle>
        <CardDescription>
          Người bán đang chuẩn bị và sẽ gửi hàng sớm nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AlertSection
          variant={!order.sellerConfirmedAt ? "warning" : "info"}
          icon={Clock}
          description={
            !order.sellerConfirmedAt
              ? "Đơn hàng đang chờ người bán xác nhận đã nhận tiền. Người bán sẽ xác nhận trong vòng 24-48 giờ."
              : "Người bán đã xác nhận nhận tiền và đang chuẩn bị hàng. Hàng sẽ được bàn giao để vận chuyển sớm nhất."
          }
        />

        {/* Order Status Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Trạng thái đơn hàng</h4>
          <div>
            <OrderTimelineItem
              icon={CheckCircle2}
              title="Thanh toán thành công"
              description={formatDate(paidAt) || "Đã xác nhận"}
              status="completed"
            />

            <OrderTimelineItem
              icon={AlertCircle}
              title={
                order.sellerConfirmedAt
                  ? "Người bán đã xác nhận nhận tiền"
                  : "Chờ người bán xác nhận nhận tiền"
              }
              description={
                order.sellerConfirmedAt
                  ? formatDate(order.sellerConfirmedAt)
                  : "Đang chờ..."
              }
              status={order.sellerConfirmedAt ? "completed" : "active"}
            />

            <OrderTimelineItem
              icon={Package}
              title={
                order.sellerConfirmedAt
                  ? "Người bán đang chuẩn bị hàng"
                  : "Chờ chuẩn bị hàng"
              }
              description={
                order.sellerConfirmedAt ? "Đang xử lý..." : "Chưa bắt đầu"
              }
              status={order.sellerConfirmedAt ? "active" : "pending"}
            />
          </div>
        </div>

        {/* Editable Shipping Info Notice */}
        <AlertSection
          variant="info"
          icon={Info}
          description="Bạn có thể chỉnh sửa thông tin giao hàng trong giai đoạn này. Sau khi người bán bàn giao hàng, thông tin sẽ không thể thay đổi."
        />

        {/* Shipping Address - Editable */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={
            order.shippingAddress ||
            order.winner?.address ||
            "Địa chỉ không khả dụng"
          }
          phoneNumber={order.phoneNumber || ""}
        />

        {/* Help Section */}
        <AlertSection
          variant="warning"
          icon={AlertCircle}
          description="Nếu quá 48 giờ mà người bán chưa xác nhận nhận tiền hoặc chưa bàn giao hàng, vui lòng liên hệ với bộ phận hỗ trợ để được giải quyết."
        />
      </CardContent>
    </Card>
  );
};

export default BuyerAwaitingStep;
