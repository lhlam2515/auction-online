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
    className: "border-green-300 bg-green-50 text-green-600",
  },
  SELLER: {
    label: "Seller",
    icon: ShieldCheck,
    className: "border-blue-300 bg-blue-50 text-blue-600",
  },
  ADMIN: {
    label: "Admin",
    icon: Shield,
    className: "border-purple-300 bg-purple-50 text-purple-600",
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
          "gap-1 border-gray-300 bg-gray-50 px-2 py-0.5 text-gray-600",
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
