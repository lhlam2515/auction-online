import type { AdminUpgradeRequest } from "@repo/shared-types";
import { Check, Eye, MoreHorizontal, X } from "lucide-react";

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
  ApproveRequestDialog,
  RejectRequestDialog,
  UpgradeRequestDetailDialog,
} from "./dialogs/index";

interface UpgradeRequestManagerProps {
  request: AdminUpgradeRequest;
  onApprove: (request: AdminUpgradeRequest, reason: string) => Promise<void>;
  onReject: (request: AdminUpgradeRequest, reason: string) => Promise<void>;
}

const UpgradeRequestManager = ({
  request,
  onApprove,
  onReject,
}: UpgradeRequestManagerProps) => {
  return (
    <div className="flex flex-col items-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <UpgradeRequestDetailDialog
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer"
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
                    className="cursor-pointer text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-700"
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
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
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
    </div>
  );
};

export default UpgradeRequestManager;
