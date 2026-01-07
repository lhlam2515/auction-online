import type { CategoryTree } from "@repo/shared-types";
import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    () => [...categories.map((cat) => ({ label: cat.name, value: cat.id }))],
    [categories]
  );

  const handleCategorySelect = (categoryValue: string) => {
    onChange?.(categoryValue === "all" ? "" : categoryValue);
  };

  return (
    <Select value={value} onValueChange={handleCategorySelect}>
      <SelectTrigger className={cn("min-w-40", className)}>
        <SelectValue placeholder="Tất cả danh mục" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="default">Tất cả danh mục</SelectItem>
        {categoryOptions.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProductSearchFilter;
