import type { ProductListing } from "@repo/shared-types";
import { useMemo, useState } from "react";

import PaginationBar from "@/components/features/product/PaginationBar";
import ProductCard from "@/components/features/product/ProductCard";
import { CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

// TODO: Define props based on SRS requirements
interface WatchListProps {
  watchlist: ProductListing[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 6;

/**
 * Component: WatchList
 * Generated automatically based on Project Auction SRS.
 */

const WatchList = ({ watchlist, loading }: WatchListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(watchlist.length / ITEMS_PER_PAGE);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return watchlist.slice(start, start + ITEMS_PER_PAGE);
  }, [watchlist, currentPage]);

  return (
    <CardContent>
      {/* Tab 3: Watchlist */}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2">Đang tải dữ liệu theo dõi</span>
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
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Chưa có sản phẩm yêu thích nào
              </p>
            </div>
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

export default WatchList;
