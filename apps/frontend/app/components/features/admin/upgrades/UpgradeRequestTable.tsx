import type { AdminUpgradeRequest } from "@repo/shared-types";
import { Loader2, ShieldAlert } from "lucide-react";

import { AppEmptyState } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import UpgradeRequestManager from "./UpgradeRequestManager";

interface UpgradeRequestTableProps {
  requests: AdminUpgradeRequest[];
  isLoading: boolean;
  onApprove: (request: AdminUpgradeRequest, reason: string) => Promise<void>;
  onReject: (request: AdminUpgradeRequest, reason: string) => Promise<void>;
}

export function UpgradeRequestTable({
  requests,
  isLoading,
  onApprove,
  onReject,
}: UpgradeRequestTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
            Đã duyệt
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
            Đã từ chối
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-600">
            Chờ duyệt
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-md border border-dashed">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <AppEmptyState
        title="Không tìm thấy yêu cầu nào"
        description="Hiện tại không có yêu cầu nâng cấp tài khoản nào cần xử lý hoặc tìm thấy theo bộ lọc."
        icon={<ShieldAlert />}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ngày yêu cầu</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.userName}</TableCell>
              <TableCell>{request.userEmail}</TableCell>
              <TableCell>
                {new Date(request.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {request.reason || "Không có lý do"}
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-right">
                <UpgradeRequestManager
                  request={request}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
