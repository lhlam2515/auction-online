import type { CategoryTree } from "@repo/shared-types";
import { Search } from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router";

import { ProductSearchFilter } from "@/components/features/product";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { APP_ROUTES } from "@/constants/routes";
import { buildUrlWithParams } from "@/lib/url";
import { debounce } from "@/lib/utils";

type SearchBarProps = {
  categories: CategoryTree[];
};

const SearchBar = ({ categories = [] }: SearchBarProps) => {
  const [query, setQuery] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Debounced search navigation
  const debouncedNavigate = React.useMemo(
    () =>
      debounce(() => {
        if (query.trim()) {
          const params = new URLSearchParams();
          params.set("q", query.trim());
          if (selectedCategoryId) {
            params.set("category", selectedCategoryId);
          }
          navigate(
            buildUrlWithParams(
              APP_ROUTES.SEARCH,
              [],
              Object.fromEntries(params.entries())
            )
          );
        }
      }, 2000),
    [query, selectedCategoryId, navigate]
  );

  // Trigger debounced search on query change
  React.useEffect(() => {
    debouncedNavigate();
  }, [debouncedNavigate]);

  // Reset search bar when navigating away from search page
  React.useEffect(() => {
    if (!location.pathname.startsWith(APP_ROUTES.SEARCH)) {
      setQuery("");
      setSelectedCategoryId("");
    }
  }, [location.pathname]);

  return (
    <InputGroup className="max-w-xl border-none">
      {/* Category Dropdown */}
      <InputGroupAddon align="inline-start" className="pl-2">
        <ProductSearchFilter
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
        />
      </InputGroupAddon>

      {/* Search Input */}
      <InputGroupInput
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        className="bg-secondary text-secondary-foreground rounded-l-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Search Button */}
      <InputGroupAddon align="inline-end" className="pr-2">
        <InputGroupButton
          variant="default"
          type="submit"
          size="icon-sm"
          className="h-9 w-9 rounded-l-none"
          aria-label="Search"
        >
          <Search className="size-5" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchBar;
