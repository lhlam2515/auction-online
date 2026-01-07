import { CheckCircle, Clock, Ban } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AccountStatus = "ACTIVE" | "PENDING_VERIFICATION" | "BANNED";

interface AccountStatusBadgeProps {
  status: AccountStatus | string;
  className?: string;
}

const statusConfig = {
  ACTIVE: {
    label: "Hoạt động",
    icon: CheckCircle,
    className: "border-green-300 bg-green-50 text-green-600",
  },
  PENDING_VERIFICATION: {
    label: "Chờ xác thực",
    icon: Clock,
    className: "border-amber-300 bg-amber-50 text-amber-600",
  },
  BANNED: {
    label: "Bị cấm",
    icon: Ban,
    className: "border-red-300 bg-red-50 text-red-600",
  },
};

const AccountStatusBadge = ({ status, className }: AccountStatusBadgeProps) => {
  const normalizedStatus = status?.toUpperCase() as AccountStatus;
  const config = statusConfig[normalizedStatus];

  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 border-gray-300 bg-gray-50 px-2 py-0.5 text-gray-600",
          className
        )}
      >
        <Clock className="h-3 w-3" /> {status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 px-2 py-0.5", config.className, className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default AccountStatusBadge;
