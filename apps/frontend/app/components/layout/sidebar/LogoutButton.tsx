import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  onLogout: () => void;
  isCollapsed: boolean;
}

export const LogoutButton = ({ onLogout, isCollapsed }: LogoutButtonProps) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "hover:bg-destructive/10 hover:text-destructive text-destructive group mt-auto w-full cursor-pointer transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors" />
          <span
            className={cn(
              "overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-500 ease-in-out",
              isCollapsed
                ? "max-w-0 opacity-0 lg:hidden"
                : "max-w-64 opacity-100"
            )}
          >
            Đăng xuất
          </span>
        </Button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          <p>Đăng xuất</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
