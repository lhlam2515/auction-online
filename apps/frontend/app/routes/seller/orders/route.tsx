import type {
  OrderWithDetails,
  PaginatedResponse,
  GetSellerOrdersParams,
  OrderStatus,
} from "@repo/shared-types";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { PaginationBar } from "@/components/common";
import { SellerOrderTable } from "@/components/features/seller";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản lý đơn hàng - Online Auction" },
    {
      name: "description",
      content: "Seller Orders List page for Online Auction App",
    },
  ];
}

export default function SellerOrdersListPage() {
  const [ordersData, setOrdersData] =
    useState<PaginatedResponse<OrderWithDetails> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    "ALL"
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params: GetSellerOrdersParams = {
          page: currentPage,
          limit: 10,
          ...(selectedStatus !== "ALL" && { status: selectedStatus }),
        };
        const res = await api.seller.getOrders(params);
        if (res?.success && res.data) {
          setOrdersData(res.data);
        } else {
          toast.error("Không thể tải danh sách đơn hàng");
          setOrdersData(null);
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu đơn hàng");
        setOrdersData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, selectedStatus]);

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả" },
      { value: "PENDING", label: "Chờ xử lý" },
      { value: "PAID", label: "Đã thanh toán" },
      { value: "SHIPPED", label: "Đã giao hàng" },
      { value: "COMPLETED", label: "Hoàn thành" },
      { value: "CANCELLED", label: "Đã hủy" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShoppingCart className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quản lý đơn hàng</CardTitle>
              <CardDescription className="text-lg">
                Xem và quản lý các đơn hàng từ phiên đấu giá đã kết thúc
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4 self-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lọc theo trạng thái:</span>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value as OrderStatus | "ALL");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
              <span className="ml-2">Đang tải danh sách đơn hàng...</span>
            </div>
          ) : (
            <>
              <SellerOrderTable orders={ordersData?.items || []} />
              {ordersData?.pagination &&
                ordersData.pagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <PaginationBar
                      currentPage={currentPage}
                      totalPages={ordersData.pagination.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
