import type { AdminUserListItem } from "@repo/shared-types";
import { MoreHorizontal, Eye, Ban, Key, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ViewUserDialog,
  ManageUserDialog,
  ResetPasswordDialog,
  BanUserDialog,
} from "./dialogs";

type AdminUserManagerProps = {
  user: AdminUserListItem;
  onRefresh?: () => void;
};

const AdminUserManager = ({ user, onRefresh }: AdminUserManagerProps) => {
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
        <ManageUserDialog
          userId={user.id}
          onSuccess={onRefresh}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
            >
              <UserCog className="h-4 w-4" />
              Cập nhật thông tin
            </DropdownMenuItem>
          }
        />

        {/* Reset Password */}
        <ResetPasswordDialog
          userId={user.id}
          userName={user.fullName}
          userEmail={user.email}
          onSuccess={onRefresh}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
            >
              <Key className="h-4 w-4" />
              Đặt lại mật khẩu
            </DropdownMenuItem>
          }
        />

        {/* Ban User */}
        <BanUserDialog
          userId={user.id}
          userName={user.fullName}
          userEmail={user.email}
          currentStatus={user.accountStatus}
          onSuccess={onRefresh}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
              variant={
                user.accountStatus === "BANNED" ? "default" : "destructive"
              }
            >
              <Ban className="h-4 w-4" />
              {user.accountStatus === "BANNED" ? "Gỡ cấm" : "Cấm người dùng"}
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminUserManager;
