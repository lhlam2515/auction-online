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
      variant: "outline" as const,
      label: "Đang đấu giá",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    },
    SOLD: {
      variant: "outline" as const,
      label: "Đã bán",
      className: "border-primary/20 bg-primary/10 text-primary",
    },
    NO_SALE: {
      variant: "outline" as const,
      label: "Không bán được",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    },
    CANCELLED: {
      variant: "outline" as const,
      label: "Đã hủy",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    SUSPENDED: {
      variant: "outline" as const,
      label: "Đã gỡ bỏ",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    PENDING: {
      variant: "outline" as const,
      label: "Chờ duyệt",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
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
