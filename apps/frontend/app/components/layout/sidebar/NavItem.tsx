import { Link, useLocation } from "react-router";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MenuItem } from "@/constants/sidebars";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { cn } from "@/lib/utils";

interface NavItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  onClick?: () => void;
}

export const NavItem = ({ item, isCollapsed, onClick }: NavItemProps) => {
  const location = useLocation();
  const { isActive: isActiveSeller, isExpired: isExpiredSeller } =
    useSellerStatus();

  const isActive = location.pathname === item.url;
  const Icon = item.icon;

  // Check if item requires active seller
  if (item.requireActiveSeller && !isActiveSeller) {
    return null;
  }

  // Handle dynamic titles
  const getDisplayTitle = () => {
    if (item.alternativeTitle) {
      const { condition, text } = item.alternativeTitle;
      if (condition === "expiredSeller" && isExpiredSeller) return text;
      if (condition === "activeSeller" && isActiveSeller) return text;
    }
    return item.title;
  };

  const displayTitle = getDisplayTitle();

  const link = (
    <Link
      to={item.url}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-lg py-2 text-sm transition-all duration-300",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
        isCollapsed ? "justify-center px-2" : "gap-3 px-3"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out",
          isCollapsed ? "max-w-0 opacity-0" : "max-w-64 opacity-100"
        )}
      >
        {displayTitle}
      </span>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {displayTitle}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};
