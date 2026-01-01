import type { UserAuthData } from "@repo/shared-types";
import {
  ChartColumn,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Gavel,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";

import UserAvatar from "@/components/common/UserAvatar";
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
import { ADMIN_ROUTES, SELLER_ROUTES } from "@/constants/routes";
import { ACCOUNT_SIDEBAR_ITEMS } from "@/constants/sidebars";

type UserDropdownMenuProps = {
  user: UserAuthData;
  onLogout: () => Promise<void>;
};

const iconMap: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  "Hồ sơ cá nhân": User,
  "Tổng quan": LayoutDashboard,
  "Lịch sử đấu giá": Gavel,
  "Danh sách theo dõi": Heart,
  "Nâng cấp tài khoản": TrendingUp,
};

const UserDropdownMenu = ({ user, onLogout }: UserDropdownMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
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
        {ACCOUNT_SIDEBAR_ITEMS.map((it) => {
          const Icon = iconMap[it.title];

          if (user.role !== "BIDDER" && it.title === "Nâng cấp tài khoản") {
            return null;
          }

          return (
            <DropdownMenuItem asChild key={it.title}>
              <Link to={it.url}>
                {Icon && <Icon className="size-4" />}
                {it.title}
              </Link>
            </DropdownMenuItem>
          );
        })}
        {user.role === "SELLER" && (
          <DropdownMenuItem asChild>
            <Link to={SELLER_ROUTES.DASHBOARD}>
              <ChartColumn className="size-4" />
              Thống kê{" "}
              <span className="font-semibold text-nowrap">(Người bán)</span>
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link to={ADMIN_ROUTES.DASHBOARD}>
              <ChartColumn className="size-4" />
              Thống kê{" "}
              <span className="font-semibold text-nowrap">(Quản trị)</span>
            </Link>
          </DropdownMenuItem>
        )}
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
