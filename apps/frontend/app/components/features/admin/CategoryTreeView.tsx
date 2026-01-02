import type { CategoryTree } from "@repo/shared-types";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  FolderTree,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AddCategoryDialog from "./AddCategoryDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import EditCategoryDialog from "./EditCategoryDialog";

type CategoryTreeViewProps = {
  categories: CategoryTree[];
  onUpdate: (categoryId: string, data: { name: string }) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

type CategoryNodeProps = {
  category: CategoryTree;
  level: number;
  onUpdate: (categoryId: string, data: { name: string }) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  allCategories: CategoryTree[];
};

const CategoryNode = ({
  category,
  level,
  onUpdate,
  onDelete,
  onRefresh,
  allCategories,
}: CategoryNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const hasChildren = category.children && category.children.length > 0;
  const paddingLeft = `${level * 1.5}rem`;

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50"
        style={{ paddingLeft }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 cursor-pointer p-0"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>

        <FolderTree className="text-muted-foreground h-4 w-4" />

        <span className="flex-1 font-medium">{category.name}</span>

        <span className="text-muted-foreground text-xs">
          {hasChildren ? `${category.children!.length} con` : ""}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 cursor-pointer p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsEditDialogOpen(true)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            {!hasChildren && (
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="text-destructive mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRefresh={onRefresh}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}

      <EditCategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={category}
        onUpdate={onUpdate}
      />

      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={category}
        onDelete={onDelete}
      />
    </div>
  );
};

const CategoryTreeView = ({
  categories,
  onUpdate,
  onDelete,
  onRefresh,
}: CategoryTreeViewProps) => {
  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          level={0}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onRefresh={onRefresh}
          allCategories={categories}
        />
      ))}
    </div>
  );
};

export default CategoryTreeView;
