import type { CategoryTree } from "@repo/shared-types";
import { ChevronDown } from "lucide-react";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { InputGroupButton } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type ProductSearchFilterProps = {
  categories: CategoryTree[];
  value?: string;
  onChange?: (categoryId: string) => void;
  className?: string;
};

const ProductSearchFilter = ({
  categories = [],
  value = "",
  onChange,
  className,
}: ProductSearchFilterProps) => {
  const categoryOptions = React.useMemo(
    () => [
      { label: "Tất cả danh mục", value: "" },
      ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
    ],
    [categories]
  );

  const selectedCategory = React.useMemo(
    () =>
      categoryOptions.find((cat) => cat.value === value) || categoryOptions[0],
    [categoryOptions, value]
  );

  const handleCategorySelect = (categoryValue: string) => {
    onChange?.(categoryValue);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={cn("min-w-40", className)}>
        <InputGroupButton
          variant="secondary"
          className="flex h-full cursor-pointer items-center justify-between gap-2 rounded-r-none"
        >
          {selectedCategory.label}
          <ChevronDown className="size-5" />
        </InputGroupButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {categoryOptions.map((category) => (
          <DropdownMenuItem
            key={category.value}
            onClick={() => handleCategorySelect(category.value)}
          >
            {category.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductSearchFilter;
