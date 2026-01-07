import type { UserAuthData } from "@repo/shared-types";
import { PanelLeftOpen, PanelLeftClose, X } from "lucide-react";
import { Link } from "react-router";

import { UserAvatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface NavProfileProps {
  user: UserAuthData | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const NavProfile = ({
  user,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}: NavProfileProps) => {
  return (
    <div
      className={cn(
        "mb-6 flex items-center px-2 transition-all duration-300",
        isCollapsed
          ? "lg:flex-col lg:justify-center lg:gap-4"
          : "justify-between gap-3"
      )}
    >
      <div className="flex min-w-0 items-center overflow-hidden transition-all duration-300">
        <Link
          to={user ? APP_ROUTES.PROFILE(user.id) : "#"}
          className={cn(
            "flex items-center transition-all duration-300 hover:opacity-80 active:scale-95",
            isCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="transition-transform hover:scale-105">
                <UserAvatar
                  name={user?.fullName || "User"}
                  imageUrl={user?.avatarUrl}
                  className="border-border/50 h-9 w-9 shrink-0 border"
                />
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p className="font-semibold">{user?.fullName}</p>
                <p className="text-muted-foreground text-xs">{user?.email}</p>
              </TooltipContent>
            )}
          </Tooltip>

          <div
            className={cn(
              "flex min-w-0 flex-col transition-all duration-500 ease-in-out",
              isCollapsed
                ? "invisible w-0 opacity-0 lg:hidden"
                : "visible w-full opacity-100"
            )}
          >
            <span className="truncate text-sm leading-tight font-semibold">
              {user?.fullName}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email}
            </span>
          </div>
        </Link>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        className="hover:bg-primary/10 hover:text-primary hidden h-8 w-8 shrink-0 transition-transform duration-300 lg:flex"
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onCloseMobile}
        className="hover:bg-primary/10 hover:text-primary flex h-8 w-8 shrink-0 lg:hidden"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
