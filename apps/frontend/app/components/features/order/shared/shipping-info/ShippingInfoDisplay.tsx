import { MapPin, Phone } from "lucide-react";

import { cn } from "@/lib/utils";

interface ShippingInfoDisplayProps {
  shippingAddress: string;
  phoneNumber: string;
}

const ShippingInfoDisplay = ({
  shippingAddress,
  phoneNumber,
}: ShippingInfoDisplayProps) => {
  return (
    <div className="space-y-4">
      {/* Shipping information display */}
      <div className="grid gap-3">
        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin
            className={cn("mt-0.5 h-5 w-5", {
              "text-green-600": shippingAddress,
              "text-amber-600": !shippingAddress,
            })}
          />
          <div className="flex-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Địa chỉ giao hàng
            </p>
            <p
              className={cn("mt-1 text-sm", {
                "text-foreground": shippingAddress,
                "text-amber-600 italic": !shippingAddress,
              })}
            >
              {shippingAddress || "Chưa có địa chỉ giao hàng"}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone
            className={cn("mt-0.5 h-5 w-5", {
              "text-green-600": phoneNumber,
              "text-amber-500": !phoneNumber,
            })}
          />
          <div className="flex-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Số điện thoại
            </p>
            <p
              className={cn("mt-1 text-sm", {
                "text-foreground": phoneNumber,
                "text-amber-600 italic": !phoneNumber,
              })}
            >
              {phoneNumber || "Chưa có số điện thoại"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfoDisplay;
