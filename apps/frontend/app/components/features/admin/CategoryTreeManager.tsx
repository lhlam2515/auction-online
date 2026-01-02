import type { CategoryTree } from "@repo/shared-types";
import { Plus, FolderTree } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import { getErrorDetails } from "@/lib/handlers/error";
import logger from "@/lib/logger";

import AddCategoryDialog from "./AddCategoryDialog";
import CategoryTreeView from "./CategoryTreeView";

type CategoryTreeManagerProps = {
  className?: string;
};

/**
 * Component: CategoryTreeManager
 * Quản lý cây danh mục với các chức năng thêm, sửa, xóa
 */
const CategoryTreeManager = ({ className }: CategoryTreeManagerProps) => {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.categories.getAll();
      if (res?.success && res.data) {
        setCategories(res.data);
      } else {
        toast.error("Không thể tải danh sách danh mục");
      }
    } catch {
      toast.error("Lỗi khi tải dữ liệu danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (data: {
    name: string;
    parentId?: string;
  }) => {
    try {
      const res = await api.admin.categories.create(data);
      if (res?.success) {
        toast.success("Thêm danh mục thành công");
        await fetchCategories(); // Reload data
        setIsAddDialogOpen(false);
      } else {
        toast.error("Không thể thêm danh mục", {
          description: res.error.message,
        });
        logger.error("Không thể thêm danh mục:", res.error.message);
      }
    } catch (error) {
      const details = getErrorDetails(error);
      toast.error("Lỗi khi thêm danh mục", {
        description: details.message,
      });
      logger.error("Lỗi khi thêm danh mục:", error, { details });
    }
  };

  const handleUpdateCategory = async (
    categoryId: string,
    data: { name: string }
  ) => {
    try {
      const res = await api.admin.categories.update(categoryId, data);
      if (res?.success) {
        toast.success("Cập nhật danh mục thành công");
        await fetchCategories(); // Reload data
      } else {
        toast.error("Không thể cập nhật danh mục", {
          description: res.error.message,
        });
        logger.error("Không thể cập nhật danh mục:", res.error.message);
      }
    } catch (error) {
      const details = getErrorDetails(error);
      toast.error("Lỗi khi cập nhật danh mục", {
        description: details.message,
      });
      logger.error("Lỗi khi cập nhật danh mục:", error, { details });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await api.admin.categories.delete(categoryId);
      if (res.success) {
        toast.success("Xóa danh mục thành công");
        await fetchCategories(); // Reload data
      } else {
        toast.error("Không thể xóa danh mục", {
          description: res.error.message,
        });
        logger.error("Không thể xóa danh mục:", res.error.message);
      }
    } catch (error) {
      const details = getErrorDetails(error);
      toast.error("Lỗi khi xóa danh mục", {
        description: details.message,
      });
      logger.error("Lỗi khi xóa danh mục:", error, { details });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
        <span className="ml-2">Đang tải danh mục...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cây danh mục</h3>
          <p className="text-muted-foreground text-sm">
            Tổng cộng {categories.length} danh mục gốc
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="cursor-pointer gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
          <FolderTree className="mb-2 h-8 w-8" />
          <p>Chưa có danh mục nào</p>
        </div>
      ) : (
        <CategoryTreeView
          categories={categories}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      <AddCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddCategory}
        categories={categories}
      />
    </div>
  );
};

export default CategoryTreeManager;
