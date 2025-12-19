import type { User, Bid, Product, ProductListing } from "@repo/shared-types";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProductCard from "@/components/features/product/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";

// TODO: Define props based on SRS requirements
type WatchListProps = {
  className?: string;
  [key: string]: any;
};

/**
 * Component: WatchList
 * Generated automatically based on Project Auction SRS.
 */

const WatchList = (props: WatchListProps) => {
  const [watchlist, setWatchlist] = useState<ProductListing[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await api.products.getWatchListByCard();
        console.log(list);
        if (list?.success && list.data) {
          setWatchlist(list.data);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        }
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
      }
    };
    fetchData();
  }, []);
  return (
    <CardContent>
      {/* Tab 3: Watchlist */}
      {/* <TabsContent value="watchlist" className="space-y-4"> */}
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

      {watchlist.length === 0 && (
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
