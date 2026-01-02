import type {
  ProductListing,
  PaginatedResponse,
  GetSellerProductsParams,
} from "@repo/shared-types";
import { Package, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { PaginationBar } from "@/components/common";
import { SellerProductTable } from "@/components/features/seller";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản lý sản phẩm - Online Auction" },
    {
      name: "description",
      content: "Seller Products List page for Online Auction App",
    },
  ];
}

export default function SellerProductsListPage() {
  const [tabsData, setTabsData] = useState<
    Record<string, PaginatedResponse<ProductListing> | null>
  >({
    ACTIVE: null,
    ENDED: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState<"ACTIVE" | "ENDED">("ACTIVE");

  useEffect(() => {
    const fetchAllTabsData = async () => {
      setIsLoading(true);
      try {
        const statuses: ("ACTIVE" | "ENDED")[] = ["ACTIVE", "ENDED"];
        const promises = statuses.map(async (status) => {
          const params: GetSellerProductsParams = {
            page: 1,
            limit: 10, // Fetch initial data for each tab
            status,
          };
          const res = await api.seller.getProducts(params);
          return { status, data: res?.success ? res.data : null };
        });

        const results = await Promise.all(promises);
        const newTabsData: Record<
          string,
          PaginatedResponse<ProductListing> | null
        > = {};
        results.forEach(({ status, data }) => {
          newTabsData[status] = data;
        });

        setTabsData(newTabsData);
      } catch {
        toast.error("Lỗi khi tải dữ liệu sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTabsData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.seller.getProducts({
          page: currentPage,
          limit: 10,
          status: currentTab,
        });
        if (res?.success && res.data) {
          setTabsData((prev) => ({
            ...prev,
            [currentTab || "ACTIVE"]: res.data,
          }));
          return res.data;
        } else {
          toast.error("Không thể tải danh sách sản phẩm");
          return null;
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu sản phẩm");
        return null;
      }
    };

    fetchProducts();
  }, [currentTab, currentPage]);

  const tabCounts: Record<string, number> = useMemo(() => {
    return {
      ACTIVE: tabsData.ACTIVE?.pagination.total || 0,
      ENDED: tabsData.ENDED?.pagination.total || 0,
    };
  }, [tabsData]);

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
                Xem và quản lý các sản phẩm bạn đang đăng bán
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
              <span className="ml-2">Đang tải danh sách sản phẩm...</span>
            </div>
          ) : (
            <Tabs
              defaultValue="ACTIVE"
              className="w-full"
              onValueChange={(value) => {
                setCurrentTab(value as "ACTIVE" | "ENDED");
                setCurrentPage(1);
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ACTIVE" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Đang đấu giá ({tabCounts.ACTIVE})
                </TabsTrigger>
                <TabsTrigger value="ENDED" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Đã kết thúc ({tabCounts.ENDED})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ACTIVE" className="mt-6">
                <SellerProductTable
                  type="active"
                  products={tabsData.ACTIVE?.items || []}
                />
                {tabsData.ACTIVE?.pagination &&
                  tabsData.ACTIVE.pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <PaginationBar
                        currentPage={currentPage}
                        totalPages={tabsData.ACTIVE.pagination.totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="ENDED" className="mt-6">
                <SellerProductTable
                  type="ended"
                  products={tabsData.ENDED?.items || []}
                />
                {tabsData.ENDED?.pagination &&
                  tabsData.ENDED.pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <PaginationBar
                        currentPage={currentPage}
                        totalPages={tabsData.ENDED.pagination.totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
