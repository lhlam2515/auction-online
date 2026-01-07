import type {
  ProductDetails,
  AdminGetProductsParams,
  CategoryTree,
} from "@repo/shared-types";
import { Package } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import PaginationBar from "@/components/common/PaginationBar";
import AdminProductSearchBar from "@/components/features/admin/products/AdminProductSearchBar";
import AdminProductTable from "@/components/features/admin/products/AdminProductTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

const PER_PAGE = 8;

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản Lý Tất Cả Sản Phẩm - Online Auction" },
    {
      name: "description",
      content: "Trang quản lý tất cả sản phẩm cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function ManageAllProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for products
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");

  // State for categories
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState("");

  // Get URL params
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const categoryId = searchParams.get("category") || "all";
  const page = searchParams.get("page") || "1";

  // Prepare query params for API
  const query: AdminGetProductsParams = useMemo(() => {
    return {
      q: q || undefined,
      status: status && status !== "all" ? (status as any) : undefined,
      categoryId: categoryId && categoryId !== "all" ? categoryId : undefined,
      page: parseInt(page, 10) || 1,
      limit: PER_PAGE,
    };
  }, [q, status, categoryId, page]);

  // Fetch categories
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setErrorCategories("");
        const response = await api.categories.getAll();
        if (response.success && isMounted) {
          setCategories(response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorCategories(
            error instanceof Error ? error.message : "Lỗi khi tải danh mục"
          );
        }
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setErrorProducts("");
      const response = await api.admin.products.getAll(query);
      if (response.success) {
        setProducts(response.data?.items || []);
        setTotalProducts(response.data?.pagination.total || 0);
        setTotalPages(response.data?.pagination.totalPages || 1);
      }
    } catch (error) {
      setErrorProducts(
        error instanceof Error ? error.message : "Lỗi khi tải sản phẩm"
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }, [query]);

  // Fetch products on query change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handler functions
  const onSearchChange = (newSearch: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (newSearch) {
      next.set("q", newSearch);
    } else {
      next.delete("q");
    }
    setSearchParams(next);
  };

  const onStatusChange = (newStatus: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (newStatus && newStatus !== "all") {
      next.set("status", newStatus);
    } else {
      next.delete("status");
    }
    setSearchParams(next);
  };

  const onCategoryChange = (newCategoryId: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (newCategoryId && newCategoryId !== "all") {
      next.set("category", newCategoryId);
    } else {
      next.delete("category");
    }
    setSearchParams(next);
  };

  const onPageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", newPage.toString());
    setSearchParams(next);
  };

  const onSuspendProduct = async (productId: string) => {
    try {
      const response = await api.admin.products.suspend(productId);
      if (response.success) {
        toast.success("Đã gỡ bỏ sản phẩm thành công");
        await fetchProducts();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi gỡ bỏ sản phẩm"
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Package className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quản lý sản phẩm</CardTitle>
              <CardDescription className="text-lg">
                Xem và quản lý tất cả sản phẩm trên hệ thống
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Spinner />
              <span className="ml-2">Đang tải danh mục...</span>
            </div>
          ) : errorCategories ? (
            <p className="text-destructive text-center">{errorCategories}</p>
          ) : (
            <AdminProductSearchBar
              searchQuery={q}
              statusFilter={status}
              categoryFilter={categoryId}
              totalProducts={totalProducts}
              categories={categories}
              onSearchChange={onSearchChange}
              onStatusChange={onStatusChange}
              onCategoryChange={onCategoryChange}
            />
          )}

          {/* Products Table */}
          {errorProducts ? (
            <p className="text-destructive text-center">{errorProducts}</p>
          ) : (
            <AdminProductTable
              products={products}
              loading={isLoadingProducts}
              onSuspendProduct={onSuspendProduct}
            />
          )}

          {/* Pagination */}
          {!isLoadingProducts && !errorProducts && totalPages > 1 && (
            <div className="flex justify-center">
              <PaginationBar
                currentPage={parseInt(page, 10) || 1}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
