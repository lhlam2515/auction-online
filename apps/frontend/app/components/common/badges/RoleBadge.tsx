import { ShieldCheck, Gavel, Shield } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Role = "BIDDER" | "SELLER" | "ADMIN";

interface RoleBadgeProps {
  role: Role | string;
  className?: string;
}

const roleConfig = {
  BIDDER: {
    label: "Bidder",
    icon: Gavel,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  SELLER: {
    label: "Seller",
    icon: ShieldCheck,
    className: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  },
  ADMIN: {
    label: "Admin",
    icon: Shield,
    className: "border-primary/20 bg-primary/10 text-primary",
  },
};

const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  const normalizedRole = role?.toUpperCase() as Role;
  const config = roleConfig[normalizedRole];

  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-muted-foreground/20 bg-muted text-muted-foreground gap-1 px-2 py-0.5",
          className
        )}
      >
        <ShieldCheck className="h-3 w-3" /> {role}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 px-2 py-0.5", config.className, className)}
    >
      <Icon className="h-3 w-3" /> {config.label}
    </Badge>
  );
};

export default RoleBadge;
