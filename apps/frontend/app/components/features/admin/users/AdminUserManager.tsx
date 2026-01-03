import type { AdminUserListItem } from "@repo/shared-types";
import { MoreHorizontal, Eye, Ban, Key, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ViewUserDialog } from "./dialogs";

type AdminUserManagerProps = {
  user: AdminUserListItem;
  onBanUser?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
};

const AdminUserManager = ({
  user,
  onBanUser,
  onResetPassword,
}: AdminUserManagerProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 cursor-pointer p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {/* View Details */}
        <ViewUserDialog
          userId={user.id}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
          }
        />

        {/* Manage User */}
        <DropdownMenuItem className="cursor-pointer">
          <UserCog className="h-4 w-4" />
          Quản lý vai trò
        </DropdownMenuItem>

        {/* Reset Password */}
        {onResetPassword && (
          <DropdownMenuItem
            onClick={() => onResetPassword(user.id)}
            className="cursor-pointer"
          >
            <Key className="h-4 w-4" />
            Đặt lại mật khẩu
          </DropdownMenuItem>
        )}

        {/* Ban User */}
        {onBanUser && user.accountStatus !== "BANNED" && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onBanUser(user.id)}
            className="cursor-pointer"
          >
            <Ban className="h-4 w-4" />
            Cấm người dùng
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminUserManager;
