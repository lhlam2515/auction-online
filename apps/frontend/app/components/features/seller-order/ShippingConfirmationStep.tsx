import type { OrderWithDetails, ShippingProvider } from "@repo/shared-types";
import { Truck, AlertCircle } from "lucide-react";

import ShippingInfo from "@/components/features/order/shipping-info";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

import ShippingForm from "./ShippingForm";

interface ShippingConfirmationStepProps {
  order: OrderWithDetails;
  onSuccess?: (updatedOrder: OrderWithDetails) => void;
}

const ShippingConfirmationStep = ({
  order,
  onSuccess,
}: ShippingConfirmationStepProps) => {
  const isShipped = order.status === "SHIPPED";
  const trackingNumberExists = !!order.trackingNumber;

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
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-600">
            <Truck className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="font-semibold">
              Hàng đã được gửi đi
            </AlertTitle>
            <AlertDescription className="text-emerald-600">
              {` Hàng đã được bàn giao vào ${formatDate(order.shippedAt || new Date())}.`}
              <span>
                Mã vận đơn: <strong>{order.trackingNumber}</strong>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-300 bg-blue-50 text-blue-600">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-semibold">
              Chuẩn bị bàn giao hàng
            </AlertTitle>
            <AlertDescription className="text-blue-600">
              Vui lòng chuẩn bị sản phẩm và nhập thông tin vận chuyển để hoàn
              tất đơn hàng.
            </AlertDescription>
          </Alert>
        )}

        {/* Shipping Address */}
        <ShippingInfo
          orderId={order.id}
          shippingAddress={order.shippingAddress || order.winner.address}
          phoneNumber={order.phoneNumber || ""}
          isEditable={false}
        />

        {/* Shipping Information Form */}
        {!isShipped && (
          <ShippingForm
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

export default ShippingConfirmationStep;
