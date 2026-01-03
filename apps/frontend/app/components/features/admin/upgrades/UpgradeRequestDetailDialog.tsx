import type { AdminUpgradeRequest } from "@repo/shared-types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpgradeRequestDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: AdminUpgradeRequest | null;
}

export function UpgradeRequestDetailDialog({
  isOpen,
  onOpenChange,
  request,
}: UpgradeRequestDetailDialogProps) {
  if (!request) return null;

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu nâng cấp</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về yêu cầu nâng cấp tài khoản.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Người dùng:</Label>
            <div className="col-span-3">{request.userName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Email:</Label>
            <div className="col-span-3">{request.userEmail}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Ngày tạo:</Label>
            <div className="col-span-3">
              {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Trạng thái:</Label>
            <div className="col-span-3">{getStatusBadge(request.status)}</div>
          </div>

          {request.processedByName && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Xử lý bởi:</Label>
              <div className="col-span-3">{request.processedByName}</div>
            </div>
          )}

          <div className="grid gap-2">
            <Label className="font-bold">Lý do nâng cấp:</Label>
            <div className="bg-muted/50 rounded-md border p-3">
              <ScrollArea className="h-[150px] w-full rounded-md">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {request.reason || "Không có lý do cụ thể."}
                </p>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
