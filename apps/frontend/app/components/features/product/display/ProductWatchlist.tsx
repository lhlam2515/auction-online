import type { ProductListing } from "@repo/shared-types";
import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import { AppEmptyState, PaginationBar } from "@/components/common";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/constants/routes";

import ProductCard from "./ProductCard";

interface ProductWatchlistProps {
  watchlist: ProductListing[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 6;

const ProductWatchlist = ({ watchlist, loading }: ProductWatchlistProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(watchlist.length / ITEMS_PER_PAGE);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return watchlist.slice(start, start + ITEMS_PER_PAGE);
  }, [watchlist, currentPage]);

  return (
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2">Đang tải danh sách theo dõi</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedList.map((item) => {
              return (
                <div key={item.id} className="group relative">
                  <ProductCard product={item} className="col-span-1" />
                </div>
              );
            })}
          </div>

          {watchlist.length === 0 && (
            <AppEmptyState
              icon={<Heart />}
              title="Danh sách theo dõi trống"
              description="Bạn chưa thêm sản phẩm nào vào danh sách theo dõi."
              action={
                <Button asChild variant="default">
                  <Link to={APP_ROUTES.SEARCH}>
                    <Search className="mr-1 h-4 w-4" />
                    Tìm kiếm sản phẩm
                  </Link>
                </Button>
              }
            />
          )}

          <div className="mt-6">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages > 0 ? totalPages : 1}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </CardContent>
  );
};

export default ProductWatchlist;
