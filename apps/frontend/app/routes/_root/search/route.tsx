import type {
  CategoryTree,
  ProductListing,
  ProductSortOption,
  SearchProductsParams,
} from "@repo/shared-types";
import React from "react";
import { useSearchParams } from "react-router";

import CategoryPanel, {
  CategoryPanelSkeleton,
} from "@/components/features/product/CategoryPanel";
import FilterPanel from "@/components/features/product/FilterPanel";
import PaginationBar from "@/components/features/product/PaginationBar";
import ProductGrid from "@/components/features/product/ProductGrid";
import SortDropdown from "@/components/features/product/SortDropdown";
import { DELAYS } from "@/constants/api";
import { api } from "@/lib/api-layer";
import { debounce } from "@/lib/utils";

import type { Route } from "./+types/route";

const PER_PAGE = 6;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 50_000_000;
const DEFAULT_STEP_PRICE = 1_000_000;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search & Browse - Online Auction" },
    {
      name: "description",
      content: "Search & Browse page for Online Auction App",
    },
  ];
}

export default function SearchBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loadingCategories, setLoadingCategories] = React.useState(false);
  const [errorCategories, setErrorCategories] = React.useState("");
  const [category, setCategory] = React.useState<CategoryTree[]>([]);

  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [errorProducts, setErrorProducts] = React.useState("");
  const [products, setProducts] = React.useState<ProductListing[]>([]);
  const [totalProducts, setTotalProducts] = React.useState(0);

  const [totalPages, setTotalPages] = React.useState(1);

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const page = searchParams.get("page") || "1";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Sync priceRange with searchParams
  const priceRange = React.useMemo(() => {
    const min = minPrice ? Number(minPrice) : DEFAULT_MIN_PRICE;
    const max = maxPrice
      ? Number(maxPrice)
      : DEFAULT_MAX_PRICE + DEFAULT_STEP_PRICE;
    return [min, max];
  }, [minPrice, maxPrice]);

  const query: SearchProductsParams = React.useMemo(() => {
    return {
      q: q || undefined,
      categoryId: categoryId || undefined,
      sort: (sort as ProductSortOption) || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: parseInt(page, 10) || 1,
      limit: PER_PAGE,
    };
  }, [q, categoryId, sort, page, minPrice, maxPrice]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setErrorCategories("");
        const category_res = await api.categories.getAll();
        if (category_res.success && isMounted) {
          setCategory(category_res.data || []);
        }
      } catch (error) {
        if (isMounted)
          setErrorCategories(
            error instanceof Error ? error.message : "Unknown error"
          );
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setErrorProducts("");
        const product_res = await api.products.search(query);
        if (product_res.success && isMounted) {
          setProducts(product_res.data?.items || []);
          setTotalProducts(product_res.data?.pagination.total || 0);
          setTotalPages(product_res.data?.pagination.totalPages || 1);
        }
      } catch (error) {
        if (isMounted)
          setErrorProducts(
            error instanceof Error ? error.message : "Unknown error"
          );
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const onSortChange = (newSort: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (!newSort || newSort === "default") {
      next.delete("sort");
    } else {
      next.set("sort", newSort);
    }
    setSearchParams(next);
  };

  const onPageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (newPage) {
      next.set("page", newPage.toString());
    } else {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const onPriceRangeChange = (newRange: number[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");

    // Handle min price
    if (newRange[0] === DEFAULT_MIN_PRICE) {
      next.delete("minPrice");
    } else {
      next.set("minPrice", newRange[0].toString());
    }

    if (newRange[1] > DEFAULT_MAX_PRICE) {
      next.delete("maxPrice");
    } else {
      next.set("maxPrice", newRange[1].toString());
    }

    setSearchParams(next);
  };

  const debouncedPriceRangeChange = React.useMemo(
    () => debounce(onPriceRangeChange, DELAYS.SEARCH),
    []
  );

  const onCategoryChange = (newCategoryId: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (newCategoryId) {
      next.set("category", newCategoryId);
    } else if (newCategoryId === "") {
      next.delete("category");
      next.delete("q");
      next.delete("minPrice");
      next.delete("maxPrice");
      next.delete("sort");
    } else {
      next.delete("category");
    }
    setSearchParams(next);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
        {/* Side bar */}
        <aside className="space-y-6">
          {/* Category Tree */}
          {loadingCategories && <CategoryPanelSkeleton />}
          {errorCategories && (
            <p className="my-8 text-center text-red-600">{errorCategories}</p>
          )}
          {!loadingCategories && !errorCategories && (
            <CategoryPanel
              categoryTrees={category}
              handleCategoryChange={onCategoryChange}
              value={categoryId}
            />
          )}

          {/* Filter panel */}
          <FilterPanel
            handlePriceRangeChange={debouncedPriceRangeChange}
            minPrice={DEFAULT_MIN_PRICE}
            maxPrice={DEFAULT_MAX_PRICE}
            stepPrice={DEFAULT_STEP_PRICE}
            value={priceRange}
          />
        </aside>

        {/* Main content area */}
        <main className="space-y-6">
          {/* Header with results count and sort dropdown */}
          <div className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
            {/* Results Count */}
            <div className="text-muted-foreground text-sm">
              Tìm thấy{" "}
              <span className="text-foreground font-semibold">
                {totalProducts}
              </span>{" "}
              sản phẩm
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Sắp xếp:</span>
              <SortDropdown handleSortChange={onSortChange} value={sort} />
            </div>
          </div>

          {/* Product Grid */}
          {loadingProducts && (
            <ProductGrid products={products} loading={true} />
          )}
          {errorProducts && (
            <p className="my-8 text-center text-red-600">{errorProducts}</p>
          )}
          {!loadingProducts && !errorProducts && products.length === 0 && (
            <p className="text-center">Không có sản phẩm hợp với yêu cầu.</p>
          )}
          {!loadingProducts && !errorProducts && products.length > 0 && (
            <ProductGrid products={products} loading={false} />
          )}

          {/* Pagination */}
          <PaginationBar
            currentPage={parseInt(page, 10) || 1}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </main>
      </div>
    </div>
  );
}
