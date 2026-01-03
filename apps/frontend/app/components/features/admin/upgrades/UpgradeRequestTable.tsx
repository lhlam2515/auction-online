import type { AdminUpgradeRequest } from "@repo/shared-types";
import { Check, Eye, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UpgradeRequestTableProps {
  requests: AdminUpgradeRequest[];
  isLoading: boolean;
  onApprove: (request: AdminUpgradeRequest) => void;
  onReject: (request: AdminUpgradeRequest) => void;
  onViewDetail: (request: AdminUpgradeRequest) => void;
}

export function UpgradeRequestTable({
  requests,
  isLoading,
  onApprove,
  onReject,
  onViewDetail,
}: UpgradeRequestTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Đã duyệt</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Đã từ chối</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Không tìm thấy yêu cầu nào.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.userName}
                </TableCell>
                <TableCell>{request.userEmail}</TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {request.reason || "Không có lý do"}
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onViewDetail(request)}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Xem chi tiết</span>
                    </Button>
                    {request.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() => onApprove(request)}
                          title="Chấp nhận"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Chấp nhận</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onReject(request)}
                          title="Từ chối"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Từ chối</span>
                        </Button>
                      </>
                    )}
                  </div>
                  {request.status !== "PENDING" && (
                    <div className="text-muted-foreground mt-1 text-xs">
                      {request.status === "APPROVED"
                        ? `Duyệt bởi ${request.processedByName || "Admin"}`
                        : `Từ chối bởi ${request.processedByName || "Admin"}`}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
