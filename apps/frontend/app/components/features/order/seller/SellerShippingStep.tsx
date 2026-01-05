import type { OrderWithDetails, ShippingProvider } from "@repo/shared-types";
import { Truck, AlertCircle, Building2 } from "lucide-react";

import { AlertSection } from "@/components/common/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { formatDate } from "@/lib/utils";
import { submitOrderShippingSchema } from "@/lib/validations/order.validation";

import { ShippingInfo, DeliveryInfoForm, SHIPPING_PROVIDERS } from "../shared";

interface SellerShippingStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const SellerShippingStep = ({ order, onSuccess }: SellerShippingStepProps) => {
  const isShipped = order.status === "SHIPPED";
  const trackingNumberExists = !!order.trackingNumber;

  const getShippingProviderName = (provider: ShippingProvider | null) => {
    return (
      SHIPPING_PROVIDERS.find((p) => p.value === provider)?.label ||
      "Chưa xác định"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bàn giao hàng cho người mua</CardTitle>
        <CardDescription>
          Nhập thông tin vận chuyển và xác nhận gửi hàng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Status Alert */}
        {isShipped && trackingNumberExists ? (
          <AlertSection
            variant="success"
            icon={Truck}
            title={`Hàng đã được bàn giao vào ${formatDate(order.shippedAt || new Date())}.`}
            description={
              <>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Đơn vị vận chuyển:</span>
                  <span className="text-sm font-medium">
                    {getShippingProviderName(order.shippingProvider)}
                  </span>
                </div>
                {trackingNumberExists && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm">Mã vận đơn:</span>
                    <span className="font-mono text-sm font-medium">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
              </>
            }
          />
        ) : (
          <AlertSection
            variant="info"
            icon={AlertCircle}
            title="Chuẩn bị bàn giao hàng"
            description="Vui lòng chuẩn bị sản phẩm và nhập thông tin vận chuyển để hoàn tất đơn hàng."
          />
        )}

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={
            order.shippingAddress ||
            order.winner?.address ||
            "Địa chỉ không khả dụng"
          }
          phoneNumber={order.phoneNumber || ""}
          isEditable={false}
        />

        {/* Shipping Information Form */}
        {!isShipped && (
          <DeliveryInfoForm
            schema={submitOrderShippingSchema}
            defaultValues={{
              shippingProvider: "VNPOST" as ShippingProvider,
              trackingNumber: "",
            }}
            onSubmit={api.orders.ship.bind(null, order.id)}
            onSuccess={(data) => {
              onSuccess?.({
                ...order,
                ...data,
              });
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SellerShippingStep;
