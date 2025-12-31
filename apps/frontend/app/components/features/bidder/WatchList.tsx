import type { ProductListing } from "@repo/shared-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProductCard from "@/components/features/product/ProductCard";
import { CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";

// TODO: Define props based on SRS requirements
interface WatchListProps {
  watchlist: ProductListing[];
  loading: boolean;
}

/**
 * Component: WatchList
 * Generated automatically based on Project Auction SRS.
 */

const WatchList = ({ watchlist, loading }: WatchListProps) => {
  return (
    <CardContent>
      {/* Tab 3: Watchlist */}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2">Đang tải dữ liệu theo dõi</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {watchlist.map((item) => {
            console.log(item);
            return (
              <div key={item.id} className="group relative">
                <ProductCard product={item} className="col-span-1" />
              </div>
            );
          })}
        </div>
      )}

      {watchlist.length === 0 && !loading && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Chưa có sản phẩm yêu thích nào
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default WatchList;
