import type { CategoryTree } from "@repo/shared-types";
import { ChevronDown, Search } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { APP_ROUTES } from "@/constants/routes";
import { buildUrlWithParams } from "@/lib/url";

type SearchBarProps = {
  categories: CategoryTree[];
};

const SearchBar = ({ categories = [] }: SearchBarProps) => {
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const categoryOptions = React.useMemo(
    () => [
      { label: "Tất cả danh mục", value: "" },
      ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
    ],
    [categories]
  );
  const [selectedCategory, setSelectedCategory] = React.useState<{
    label: string;
    value: string;
  }>(categoryOptions[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && selectedCategory) {
      const params = new URLSearchParams();
      params.set("q", query.trim());
      if (selectedCategory.value) {
        params.set("category", selectedCategory.value);
      }

      navigate(
        buildUrlWithParams(
          APP_ROUTES.SEARCH,
          [],
          Object.fromEntries(params.entries())
        )
      );
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <InputGroup className="max-w-xl border-none">
        {/* Category Dropdown */}
        <InputGroupAddon align="inline-start" className="pl-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="min-w-40">
              <InputGroupButton
                variant="default"
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
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>

        {/* Search Input */}
        <InputGroupInput
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          className="bg-primary text-primary-foreground placeholder:text-primary-foreground/70 rounded-l-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Search Button */}
        <InputGroupAddon align="inline-end" className="pr-2">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80 h-9 w-9 rounded-l-none"
            aria-label="Search"
          >
            <Search className="size-5" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
};

export default SearchBar;
