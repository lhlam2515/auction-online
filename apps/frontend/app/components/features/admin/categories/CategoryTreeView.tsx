import type { CategoryTree } from "@repo/shared-types";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  MoreHorizontal,
  Edit,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_ROUTES } from "@/constants/routes";
import { appendQueryParams } from "@/lib/url";

import { DeleteCategoryDialog, EditCategoryDialog } from "./dialogs";

type CategoryTreeViewProps = {
  categories: CategoryTree[];
  onUpdate: (categoryId: string, data: { name: string }) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
};

type CategoryNodeProps = {
  category: CategoryTree;
  level: number;
  onUpdate: (categoryId: string, data: { name: string }) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
};

const CategoryNode = ({
  category,
  level,
  onUpdate,
  onDelete,
}: CategoryNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
          className="h-6 w-6 p-0"
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

        <Link
          to={appendQueryParams(ADMIN_ROUTES.PRODUCTS, {
            category: category.id,
          })}
          className="flex-1 font-medium hover:underline"
        >
          {category.name}
        </Link>

        <span className="text-muted-foreground text-xs">
          {hasChildren ? `${category.children!.length} con` : ""}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Mở menu danh mục</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditCategoryDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-1 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              }
              category={category}
              onUpdate={onUpdate}
            />

            {!hasChildren && (
              <DeleteCategoryDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    variant="destructive"
                  >
                    <Trash className="mr-1 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                }
                category={category}
                onDelete={onDelete}
              />
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTreeView = ({
  categories,
  onUpdate,
  onDelete,
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
        />
      ))}
    </div>
  );
};

export default CategoryTreeView;
