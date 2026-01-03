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
import { cn } from "@/lib/utils";

type AdminUserSearchBarProps = {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
  totalUsers: number;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  className?: string;
};

const AdminUserSearchBar = ({
  searchQuery,
  roleFilter,
  statusFilter,
  sortBy,
  sortOrder,
  totalUsers,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  className,
}: AdminUserSearchBarProps) => {
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);

  const roleOptions = [
    { value: "all", label: "Tất cả vai trò" },
    { value: "BIDDER", label: "Bidder" },
    { value: "SELLER", label: "Seller" },
    { value: "ADMIN", label: "Admin" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "PENDING_VERIFICATION", label: "Chờ xác thực" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "BANNED", label: "Bị cấm" },
  ];

  const sortByOptions = [
    { value: "createdAt", label: "Ngày tạo" },
    { value: "fullName", label: "Tên" },
    { value: "email", label: "Email" },
    { value: "ratingScore", label: "Điểm đánh giá" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "Giảm dần" },
    { value: "asc", label: "Tăng dần" },
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
    <div className={cn(className)}>
      <div className="flex flex-col gap-4">
        {/* First Row: Search and Role */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Search Input */}
          <div className="flex-1">
            <label className="text-sm font-medium">Tìm kiếm người dùng</label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Nhập tên, email hoặc username..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="min-w-[180px]">
            <label className="text-sm font-medium">Vai trò</label>
            <Select value={roleFilter} onValueChange={onRoleChange}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[180px]">
            <label className="text-sm font-medium">Trạng thái</label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="cursor-pointer">
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
        </div>

        {/* Second Row: Sort Options and Search Button */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Sort By */}
          <div className="min-w-[180px]">
            <label className="text-sm font-medium">Sắp xếp theo</label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn trường" />
              </SelectTrigger>
              <SelectContent>
                {sortByOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="min-w-[180px]">
            <label className="text-sm font-medium">Thứ tự</label>
            <Select value={sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn thứ tự" />
              </SelectTrigger>
              <SelectContent>
                {sortOrderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          {/* Search Button */}
          <Button onClick={handleSearchClick} className="cursor-pointer">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-muted-foreground mt-4 text-sm">
        Tìm thấy{" "}
        <span className="text-foreground font-semibold">{totalUsers}</span>{" "}
        người dùng
      </div>
    </div>
  );
};

export default AdminUserSearchBar;
