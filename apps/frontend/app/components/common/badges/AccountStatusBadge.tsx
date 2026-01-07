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
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  PENDING_VERIFICATION: {
    label: "Chờ xác thực",
    icon: Clock,
    className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  },
  BANNED: {
    label: "Bị cấm",
    icon: Ban,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
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
          "border-border bg-muted/50 text-muted-foreground gap-1 px-2 py-0.5",
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
