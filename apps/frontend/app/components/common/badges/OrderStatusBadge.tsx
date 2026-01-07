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
          "border-amber-500/20 bg-amber-500/10 text-amber-600":
            status === "PENDING",
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600":
            status === "PAID",
          "border-primary/20 bg-primary/10 text-primary": status === "SHIPPED",
          "border-transparent bg-emerald-600 text-white":
            status === "COMPLETED",
          "border-destructive/20 bg-destructive/10 text-destructive":
            status === "CANCELLED",
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
