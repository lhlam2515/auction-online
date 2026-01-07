import type { AdminUserListItem } from "@repo/shared-types";
import { User, Mail, Star, Calendar, RefreshCcw } from "lucide-react";

import { UserAvatar, AppEmptyState } from "@/components/common";
import { RoleBadge, AccountStatusBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";

import AdminUserManager from "./AdminUserManager";

type AdminUserTableProps = {
  users: AdminUserListItem[];
  loading?: boolean;
  className?: string;
  onRefresh?: () => void;
};

const AdminUserTable = ({
  users,
  loading = false,
  className,
  onRefresh,
}: AdminUserTableProps) => {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <AppEmptyState
        title="Không tìm thấy người dùng"
        description="Không có tài khoản nào phù hợp với điều kiện tìm kiếm của bạn."
        icon={<User />}
        action={
          onRefresh && (
            <Button onClick={onRefresh}>
              <RefreshCcw className="mr-1 h-4 w-4" />
              Tải lại dữ liệu
            </Button>
          )
        }
        className={className}
      />
    );
  }

  return (
    <div className={cn(className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={user.fullName}
                      imageUrl={user.avatarUrl}
                      className="h-10 w-10"
                      fallbackClassName="text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{user.fullName}</p>
                      <p className="text-muted-foreground truncate text-sm">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">{user.email}</span>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <AccountStatusBadge status={user.accountStatus} />
                </TableCell>

                {/* Rating */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">
                      {(user.ratingScore * 100).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-sm">
                      ({user.ratingCount})
                    </span>
                  </div>
                </TableCell>

                {/* Created At */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="text-sm">
                      {formatDate(new Date(user.createdAt))}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-center">
                  <AdminUserManager user={user} onRefresh={onRefresh} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUserTable;
