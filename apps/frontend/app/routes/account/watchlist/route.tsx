import type {
  ProductListing,
  ProductSortOption,
  SearchProductsParams,
} from "@repo/shared-types";
import { Heart, UserIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import WatchList from "@/components/features/bidder/WatchList";
import PaginationBar from "@/components/features/product/PaginationBar";
import SortDropdown from "@/components/features/product/SortDropdown";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ERROR_MESSAGES } from "@/constants/api";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Watch List - Online Auction" },
    { name: "description", content: "Watch List page for Online Auction App" },
  ];
}

export default function WatchListPage() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [watchlist, setWatchlist] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "";

  const query: SearchProductsParams = useMemo(() => {
    return {
      sort: (sort as ProductSortOption) || undefined,
      // page: parseInt(page, 10) || 1,
      // limit: PER_PAGE,
    };
  }, [sort]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await api.products.getWatchListByCard(query);
        if (list?.success && list.data) {
          setWatchlist(list.data);
          setTotalProducts(list.data.length);
          setLoading(false);
        } else {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
          setLoading(false);
        }
      } catch (error) {
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const onSortChange = (newSort: string) => {
    const next = new URLSearchParams(searchParams);
    if (!newSort || newSort === "default") {
      next.delete("sort");
    } else {
      next.set("sort", newSort);
    }
    setSearchParams(next);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Heart className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Danh sách yêu thích</CardTitle>
            <CardDescription className="text-lg">
              Theo dõi các sản phẩm yêu thích
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
          {/* Results Count */}
          <div className="text-muted-foreground text-sm">
            Tổng{" "}
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
      </CardContent>

      <WatchList watchlist={watchlist} loading={loading} />
    </Card>
  );
}
