import type { CategoryTree } from "@repo/shared-types";
import { AlertTriangle, Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryTree;
  onDelete: (categoryId: string) => Promise<void>;
};

const DeleteCategoryDialog = ({
  open,
  onOpenChange,
  category,
  onDelete,
}: DeleteCategoryDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChildren = category.children && category.children.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa danh mục
          </DialogTitle>
          <p>
            Bạn có chắc chắn muốn xóa danh mục <b>{category.name}</b>?
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {hasChildren && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Cảnh báo!</p>
                  <p>
                    Không thể xóa danh mục cha do danh mục này đang có{" "}
                    {category.children!.length} danh mục con.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasChildren && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Lưu ý!</p>
                  <p>
                    Không thể xóa danh mục nếu nó đã có sản phẩm.
                    <br />
                    Hệ thống sẽ ngăn không cho bạn xóa trong trường hợp này.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm">
            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến danh
            mục này sẽ bị ảnh hưởng.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={hasChildren || isDeleting}
            className="cursor-pointer gap-2"
          >
            {isDeleting ? (
              "Đang xóa..."
            ) : (
              <>
                <Trash className="h-4 w-4" />
                Xóa danh mục
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
