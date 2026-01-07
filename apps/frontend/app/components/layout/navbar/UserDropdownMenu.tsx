import type { UserAuthData } from "@repo/shared-types";
import { ChevronDown, LogOut } from "lucide-react";
import { Link } from "react-router";

import UserAvatar from "@/components/common/UserAvatar";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { USER_DROPDOWN_ITEMS } from "@/constants/user-dropdown";

type UserDropdownMenuProps = {
  user: UserAuthData;
  onLogout: () => Promise<void>;
};

/**
 * User Dropdown Menu with role-based items
 * Uses RoleGuard to show appropriate menu items based on user role
 * Supports dynamic titles based on user context (e.g., expired seller)
 */
const UserDropdownMenu = ({ user, onLogout }: UserDropdownMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-primary/10 hover:text-primary flex items-center gap-2 transition-all duration-300"
        >
          <UserAvatar
            name={user.fullName}
            imageUrl={user.avatarUrl}
            className="h-6 w-6"
            fallbackClassName="text-sm"
          />
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

        {/* Dynamic menu items based on user role */}
        {USER_DROPDOWN_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <RoleGuard key={item.url} roles={item.roles}>
              <DropdownMenuItem asChild>
                <Link to={item.url}>
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </DropdownMenuItem>
            </RoleGuard>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive">
          <LogOut className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
