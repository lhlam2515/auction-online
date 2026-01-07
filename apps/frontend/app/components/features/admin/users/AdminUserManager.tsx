import type { AdminUserListItem } from "@repo/shared-types";
import { MoreHorizontal, Eye, Ban, Key, UserCog, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ViewUserDialog,
  ManageUserDialog,
  ResetPasswordDialog,
  BanUserDialog,
  DeleteUserDialog,
} from "./dialogs";

type AdminUserManagerProps = {
  user: AdminUserListItem;
  onRefresh?: () => void;
};

const AdminUserManager = ({ user, onRefresh }: AdminUserManagerProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {/* View Details */}
        <ViewUserDialog
          userId={user.id}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Eye className="mr-1 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
          }
        />

        {/* Manage User */}
        <ManageUserDialog
          userId={user.id}
          onSuccess={onRefresh}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserCog className="mr-1 h-4 w-4" />
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
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Key className="mr-1 h-4 w-4" />
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
              variant={
                user.accountStatus === "BANNED" ? "default" : "destructive"
              }
            >
              <Ban className="mr-1 h-4 w-4" />
              {user.accountStatus === "BANNED" ? "Gỡ cấm" : "Cấm người dùng"}
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        {/* Delete User */}
        <DeleteUserDialog
          userId={user.id}
          userName={user.fullName}
          userEmail={user.email}
          userRole={user.role}
          onSuccess={onRefresh}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              variant="destructive"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Xóa người dùng
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminUserManager;
