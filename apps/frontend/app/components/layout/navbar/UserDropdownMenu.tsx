import type { UserAuthData } from "@repo/shared-types";
import { ChartColumn, ChevronDown, LogOut, User } from "lucide-react";
import { Link } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ACCOUNT_ROUTES,
  ADMIN_ROUTES,
  SELLER_ROUTES,
} from "@/constants/routes";

type UserDropdownMenuProps = {
  user: UserAuthData;
  onLogout: () => Promise<void>;
};

const UserDropdownMenu = ({ user, onLogout }: UserDropdownMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="object-cover"
                width={24}
                height={24}
              />
            ) : (
              <AvatarFallback>
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="hidden lg:inline">{user.fullName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{user.fullName}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ACCOUNT_ROUTES.PROFILE}>
            <User />
            Hồ sơ
          </Link>
        </DropdownMenuItem>
        {user.role === "SELLER" && (
          <DropdownMenuItem asChild>
            <Link to={SELLER_ROUTES.DASHBOARD}>
              <ChartColumn className="size-5" />
              Bảng điều khiển
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link to={ADMIN_ROUTES.DASHBOARD}>
              <ChartColumn className="size-5" />
              Bảng điều khiển
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive">
          <LogOut />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
