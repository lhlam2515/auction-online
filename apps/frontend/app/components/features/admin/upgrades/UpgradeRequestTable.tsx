import type { AdminUpgradeRequest } from "@repo/shared-types";
import { Check, Eye, Loader2, MoreHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ApproveRequestDialog,
  RejectRequestDialog,
  UpgradeRequestDetailDialog,
} from "./dialogs";

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                      <UpgradeRequestDetailDialog
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                        }
                        request={request}
                      />
                      {request.status === "PENDING" && (
                        <>
                          <DropdownMenuSeparator />
                          <ApproveRequestDialog
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-700"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Chấp nhận
                              </DropdownMenuItem>
                            }
                            request={request}
                            onConfirm={(reason) => onApprove(request, reason)}
                          />
                          <RejectRequestDialog
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Từ chối
                              </DropdownMenuItem>
                            }
                            request={request}
                            onConfirm={(reason) => onReject(request, reason)}
                          />
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
