import type { ProductStatus } from "@repo/shared-types";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductStatusBadgeProps = {
  status: ProductStatus;
  className?: string;
};

const ProductStatusBadge = ({ status, className }: ProductStatusBadgeProps) => {
  const statusConfig = {
    ACTIVE: {
      variant: "secondary" as const,
      label: "Đang đấu giá",
      className: "bg-emerald-100 text-emerald-800",
    },
    SOLD: {
      variant: "secondary" as const,
      label: "Đã bán",
      className: "bg-blue-100 text-blue-800",
    },
    NO_SALE: {
      variant: "secondary" as const,
      label: "Không bán được",
      className: "bg-yellow-100 text-yellow-800",
    },
    CANCELLED: {
      variant: "secondary" as const,
      label: "Đã hủy",
      className: "bg-red-100 text-red-800",
    },
    SUSPENDED: {
      variant: "secondary" as const,
      label: "Đã gỡ bỏ",
      className: "bg-orange-100 text-orange-800",
    },
    PENDING: {
      variant: "secondary" as const,
      label: "Chờ duyệt",
      className: "bg-gray-100 text-gray-800",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "secondary" as const,
    label: status,
    className: "bg-gray-100 text-gray-800 px-2 py-0.5",
  };

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default ProductStatusBadge;
