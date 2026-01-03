import type { AdminUpgradeRequest } from "@repo/shared-types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Shield,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Đã duyệt",
          className:
            "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
          icon: <CheckCircle2 className="mr-1 h-3.5 w-3.5" />,
        };
      case "REJECTED":
        return {
          label: "Đã từ chối",
          className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
          icon: <XCircle className="mr-1 h-3.5 w-3.5" />,
        };
      case "PENDING":
        return {
          label: "Chờ duyệt",
          className:
            "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
          icon: <Clock className="mr-1 h-3.5 w-3.5" />,
        };
      default:
        return {
          label: status,
          className:
            "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200",
          icon: <AlertCircle className="mr-1 h-3.5 w-3.5" />,
        };
    }
  };

  const statusConfig = getStatusConfig(request.status);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-6 w-6" />
            <DialogTitle className="text-xl">
              Chi tiết yêu cầu nâng cấp
            </DialogTitle>
          </div>
          <DialogDescription>
            Xem xét thông tin chi tiết và lý do nâng cấp tài khoản lên Seller.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* User Info Section */}
          <div className="bg-muted/30 flex items-start gap-4 rounded-lg border p-4">
            <div className="bg-primary/10 rounded-full p-3">
              <User className="text-primary h-6 w-6" />
            </div>
            <div className="grid gap-1">
              <h3 className="text-lg leading-none font-semibold">
                {request.userName}
              </h3>
              <div className="text-muted-foreground flex items-center text-sm">
                <Mail className="mr-2 h-3.5 w-3.5" />
                {request.userEmail}
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <Calendar className="h-3.5 w-3.5" /> Ngày gửi yêu cầu
              </span>
              <p className="text-sm font-medium">
                {format(new Date(request.createdAt), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
            {request.processedAt && (
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ngày xử lý
                </span>
                <p className="text-sm font-medium">
                  {format(new Date(request.processedAt), "HH:mm - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              </div>
            )}
            {request.processedByName && (
              <div className="col-span-2 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <Shield className="h-3.5 w-3.5" /> Người xử lý
                </span>
                <p className="text-sm font-medium">{request.processedByName}</p>
              </div>
            )}
          </div>

          {/* Reason Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="text-primary h-4 w-4" />
              <h4 className="text-sm font-semibold">Lý do nâng cấp</h4>
            </div>
            <div className="bg-card text-card-foreground rounded-md border shadow-sm">
              <ScrollArea className="h-[120px] w-full rounded-md p-4">
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap italic">
                  "{request.reason || "Không có lý do cụ thể."}"
                </p>
              </ScrollArea>
            </div>
          </div>

          {/* Admin Note Section (if exists) */}
          {request.adminNote && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-destructive h-4 w-4" />
                <h4 className="text-destructive text-sm font-semibold">
                  Ghi chú của Admin
                </h4>
              </div>
              <div className="border-destructive/20 bg-destructive/5 rounded-md border p-4">
                <p className="text-destructive-foreground text-sm">
                  {request.adminNote}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
