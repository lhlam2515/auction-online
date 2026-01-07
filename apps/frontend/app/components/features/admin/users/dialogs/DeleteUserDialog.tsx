import { AlertTriangle, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { AlertSection, ConfirmationDialog } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-layer";

type DeleteUserDialogProps = {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: "BIDDER" | "SELLER" | "ADMIN";
  onSuccess?: () => void;
  trigger: ReactNode;
};

const DeleteUserDialog = ({
  userId,
  userName,
  userEmail,
  userRole,
  onSuccess,
  trigger,
}: DeleteUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      setOpen(newOpen);
      if (!newOpen) {
        setReason("");
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await api.admin.users.delete(userId, {
        reason: reason.trim() || undefined,
      });
      toast.success(`Đã xóa người dùng ${userName} thành công`);
      setOpen(false);
      setReason("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete user:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Không thể xóa người dùng. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getWarningMessages = () => {
    const messages = [];

    if (userRole === "SELLER") {
      messages.push(
        "• Không thể xóa nếu có sản phẩm đang trong thời gian đấu giá"
      );
      messages.push("• Không thể xóa nếu có đơn hàng chưa hoàn tất");
    }

    if (userRole === "BIDDER") {
      messages.push(
        "• Không thể xóa nếu đang giữ giá cao nhất ở một phiên đấu giá"
      );
      messages.push("• Không thể xóa nếu có đơn hàng đang chờ xác nhận");
    }

    return messages;
  };

  const getRoleLabel = () => {
    if (userRole === "SELLER") return "Người bán";
    if (userRole === "BIDDER") return "Người mua";
    return "Admin";
  };

  const isReasonValid =
    reason.trim().length === 0 || reason.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Xóa người dùng
          </DialogTitle>
          <DialogDescription>
            Bạn đang thực hiện xóa người dùng{" "}
            <span className="font-bold">{userName}</span> ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <AlertSection
            variant="destructive"
            icon={AlertTriangle}
            title="Hành động này không thể hoàn tác!"
            description="Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống."
          />

          {/* Business Constraints */}
          <AlertSection
            variant="warning"
            icon={AlertTriangle}
            title={`Ràng buộc nghiệp vụ (vai trò: ${getRoleLabel()})`}
            description={
              <>
                <div className="mt-2 space-y-2">
                  <ul className="space-y-1 text-sm">
                    {getWarningMessages().map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Nếu vi phạm bất kỳ điều kiện nào, hệ thống sẽ từ chối xóa và
                    hiển thị lý do cụ thể.
                  </p>
                </div>
              </>
            }
          />

          {/* Optional Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Lý do xóa (tùy chọn, tối thiểu 10 ký tự nếu nhập)
            </Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do xóa người dùng này..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isDeleting}
              rows={3}
              className="resize-none"
            />
            {!isReasonValid && (
              <p className="text-destructive text-sm">
                Lý do phải có ít nhất 10 ký tự
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <ConfirmationDialog
            trigger={
              <Button variant="destructive" disabled={!isReasonValid}>
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa người dùng
              </Button>
            }
            variant="danger"
            title="Xác nhận xóa người dùng"
            description={
              <div className="space-y-3">
                <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
                <ul className="bg-muted space-y-2 rounded-md p-3 text-sm">
                  <li>
                    <b>Tên:</b> {userName}
                  </li>
                  <li>
                    <b>Email:</b> {userEmail}
                  </li>
                  <li>
                    <b>Vai trò:</b> {getRoleLabel()}
                  </li>
                  {reason.trim() && (
                    <li>
                      <b>Lý do:</b> {reason.trim()}
                    </li>
                  )}
                </ul>
                <p className="text-destructive font-semibold">
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            }
            confirmLabel="Xác nhận xóa"
            confirmIcon={Trash2}
            onConfirm={handleConfirmDelete}
            isConfirming={isDeleting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
