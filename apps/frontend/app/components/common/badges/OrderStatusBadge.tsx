import type { OrderStatus } from "@repo/shared-types";
import {
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const OrderStatusBadge = ({
  status,
  size = "md",
  className,
}: OrderStatusBadgeProps) => {
  const textOnStatus: Record<OrderStatus, string> = {
    PENDING: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    SHIPPED: "Đã vận chuyển",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  const iconOnStatus: Record<OrderStatus, LucideIcon> = {
    PENDING: Clock,
    PAID: CheckCircle,
    SHIPPED: Truck,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
  };

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0 gap-1",
    md: "text-xs px-2 py-0.5 gap-1",
    lg: "text-sm px-3 py-1 gap-1.5",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const Icon = iconOnStatus[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        {
          "border-amber-300 bg-amber-50 text-amber-600": status === "PENDING",
          "border-emerald-300 bg-emerald-50 text-emerald-600":
            status === "PAID",
          "border-purple-300 bg-purple-50 text-purple-600":
            status === "SHIPPED",
          "bg-emerald-600 text-emerald-50": status === "COMPLETED",
          "border-red-300 bg-red-50 text-red-600": status === "CANCELLED",
        },
        className
      )}
    >
      <Icon className={iconSizeClasses[size]} />
      {textOnStatus[status]}
    </Badge>
  );
};

export default OrderStatusBadge;
