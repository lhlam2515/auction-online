import { DialogDescription } from "@radix-ui/react-dialog";
import type { CategoryTree } from "@repo/shared-types";
import { AlertTriangle, Trash } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteCategoryDialogProps = {
  trigger: ReactNode;
  category: CategoryTree;
  onDelete: (categoryId: string) => Promise<void>;
};

const DeleteCategoryDialog = ({
  trigger,
  category,
  onDelete,
}: DeleteCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChildren = category.children && category.children.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash className="h-5 w-5" />
            Xác nhận xóa danh mục
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa danh mục{" "}
            <span className="font-bold">{category.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {hasChildren && (
            <AlertSection
              variant="warning"
              icon={AlertTriangle}
              title="Cảnh báo!"
              description={`Không thể xóa danh mục cha do danh mục này đang có ${category.children!.length} danh mục con.`}
            />
          )}

          {!hasChildren && (
            <AlertSection
              variant="warning"
              icon={AlertTriangle}
              title="Lưu ý!"
              description="Không thể xóa danh mục nếu nó đã có sản phẩm. Hệ thống sẽ ngăn không cho bạn xóa trong trường hợp này."
            />
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
            onClick={() => setOpen(false)}
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
