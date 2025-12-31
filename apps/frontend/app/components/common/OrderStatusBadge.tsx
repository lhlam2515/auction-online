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

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
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

  const Icon = iconOnStatus[status];

  return (
    <Badge
      variant="outline"
      className={cn({
        "border-amber-300 bg-amber-50 text-amber-600": status == "PENDING",
        "border-emerald-300 bg-emerald-50 text-emerald-600": status == "PAID",
        "border-purple-300 bg-purple-50 text-purple-600": status == "SHIPPED",
        "bg-emerald-600 text-emerald-50": status == "COMPLETED",
        "border-red-300 bg-red-50 text-red-600": status == "CANCELLED",
      })}
    >
      <Icon className="h-4 w-4" />
      {textOnStatus[status]}
    </Badge>
  );
};

export default OrderStatusBadge;
