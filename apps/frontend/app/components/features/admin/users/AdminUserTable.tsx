import type { AdminUserListItem } from "@repo/shared-types";
import { User, Mail, Star, Calendar } from "lucide-react";

import { UserAvatar } from "@/components/common";
import { RoleBadge, AccountStatusBadge } from "@/components/common/badges";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

type AdminUserTableProps = {
  users: AdminUserListItem[];
  loading?: boolean;
  className?: string;
};

const AdminUserTable = ({
  users,
  loading = false,
  className,
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <User className="text-muted-foreground h-12 w-12 opacity-50" />
          <p className="text-muted-foreground text-sm">
            Không có người dùng nào
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
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
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <User className="text-primary h-5 w-5" />
                    </div> */}
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
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
                <TableCell className="text-right">
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to={`/admin/users/${user.id}`}>Chi tiết</Link>
                  </Button> */}
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
