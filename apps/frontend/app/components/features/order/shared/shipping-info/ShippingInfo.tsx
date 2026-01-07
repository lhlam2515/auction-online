import { Edit2, Edit3 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-layer";
import { cn } from "@/lib/utils";
import { updateShippingInfoSchema } from "@/lib/validations/order.validation";

import ShippingInfoDisplay from "./ShippingInfoDisplay";
import ShippingInfoForm from "./ShippingInfoForm";

type ShippingInfoProps = {
  orderId: string;
  shippingAddress: string;
  phoneNumber: string;
  isEditable?: boolean;
};

const ShippingInfo = ({
  orderId,
  shippingAddress,
  phoneNumber,
  isEditable = true,
}: ShippingInfoProps) => {
  const [shippingAddressState, setShippingAddressState] =
    React.useState(shippingAddress);
  const [phoneNumberState, setPhoneNumberState] = React.useState(phoneNumber);
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Thông tin giao hàng</Label>
        {isEditable ? (
          !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="mr-1 h-4 w-4" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Edit3 className="mr-1 h-4 w-4" /> Đang chỉnh sửa
            </div>
          )
        ) : null}
      </div>

      <div
        className={cn(
          "rounded-lg border p-4 transition-all duration-200",
          !isEditing
            ? !shippingAddressState || !phoneNumberState
              ? "border-amber-300 bg-amber-50"
              : "border-emerald-300 bg-emerald-50"
            : "border-border bg-card shadow-sm"
        )}
      >
        {isEditing ? (
          <ShippingInfoForm
            schema={updateShippingInfoSchema}
            defaultValues={{
              shippingAddress: shippingAddressState,
              phoneNumber: phoneNumberState,
            }}
            onSubmit={api.orders.updateShipping.bind(null, orderId)}
            onSuccess={(data) => {
              setShippingAddressState(data.shippingAddress);
              setPhoneNumberState(data.phoneNumber);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ShippingInfoDisplay
            shippingAddress={shippingAddressState}
            phoneNumber={phoneNumberState}
          />
        )}
      </div>
    </div>
  );
};

export default ShippingInfo;
