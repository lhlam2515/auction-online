import { Search } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryTree = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTree[];
};

type AdminProductSearchBarProps = {
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  totalProducts: number;
  categories: CategoryTree[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  className?: string;
};

// Flatten category tree for select options
const flattenCategories = (
  categories: CategoryTree[]
): { id: string; name: string; level: number }[] => {
  const result: { id: string; name: string; level: number }[] = [];

  const traverse = (items: CategoryTree[], level: number = 0) => {
    for (const item of items) {
      result.push({ id: item.id, name: item.name, level });
      if (item.children && item.children.length > 0) {
        traverse(item.children, level + 1);
      }
    }
  };

  traverse(categories);
  return result;
};

const AdminProductSearchBar = ({
  searchQuery,
  statusFilter,
  categoryFilter,
  totalProducts,
  categories,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  className,
}: AdminProductSearchBarProps) => {
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  const flatCategories = React.useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Đang đấu giá" },
    { value: "SOLD", label: "Đã bán" },
    { value: "NO_SALE", label: "Không bán được" },
    { value: "SUSPENDED", label: "Đã gỡ bỏ" },
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchChange(localSearchQuery);
    }
  };

  const handleSearchClick = () => {
    onSearchChange(localSearchQuery);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Search Input */}
        <div className="flex-1">
          <label className="text-sm font-medium">Tìm kiếm sản phẩm</label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[180px]">
          <label className="text-sm font-medium">Trạng thái</label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="min-w-[180px]">
          <label className="text-sm font-medium">Danh mục</label>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {flatCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span style={{ paddingLeft: `${category.level * 16}px` }}>
                    {category.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearchClick}>
          <Search className="mr-1 h-4 w-4" />
          Tìm kiếm
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-muted-foreground mt-4 text-sm">
        Tìm thấy{" "}
        <span className="text-foreground font-semibold">{totalProducts}</span>{" "}
        sản phẩm
      </div>
    </div>
  );
};

export default AdminProductSearchBar;
