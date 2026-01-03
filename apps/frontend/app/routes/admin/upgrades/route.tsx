import type { AdminUpgradeRequest } from "@repo/shared-types";
import { UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import {
  UpgradeRequestFilters,
  UpgradeRequestTable,
} from "@/components/features/admin/upgrades";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Phê Duyệt Nâng Cấp - Online Auction" },
    {
      name: "description",
      content: "Trang phê duyệt nâng cấp cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function ApproveUpgradesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<AdminUpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const page = Number(searchParams.get("page")) || 1;
  const status =
    (searchParams.get("status") as
      | "pending"
      | "approved"
      | "rejected"
      | "all") || "all";
  const search = searchParams.get("search") || "";

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.admin.upgrades.getAll({
        page,
        limit: 10,
        status:
          status === "all"
            ? undefined
            : (status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED"),
        search: search || undefined,
      });

      if (response.success) {
        // Cast response.data.items to AdminUpgradeRequest[] because api-layer might be using a different type
        setRequests(response.data.items as unknown as AdminUpgradeRequest[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error("Không thể tải danh sách yêu cầu nâng cấp");
      }
    } catch (error) {
      console.error("Failed to fetch upgrade requests:", error);
      toast.error("Không thể tải danh sách yêu cầu nâng cấp");
    } finally {
      setIsLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = (term: string) => {
    setSearchParams((prev) => {
      if (term) {
        prev.set("search", term);
      } else {
        prev.delete("search");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const handleStatusChange = (value: string) => {
    setSearchParams((prev) => {
      if (value === "all") {
        prev.delete("status");
      } else {
        prev.set("status", value);
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  const handleApproveConfirm = async (
    request: AdminUpgradeRequest,
    reason: string
  ) => {
    try {
      await api.admin.upgrades.approve(request.id, {
        adminNote: reason,
      });
      toast.success("Đã chấp nhận yêu cầu nâng cấp");
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast.error("Có lỗi xảy ra khi chấp nhận yêu cầu");
    }
  };

  const handleRejectConfirm = async (
    request: AdminUpgradeRequest,
    reason: string
  ) => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await api.admin.upgrades.reject(request.id, {
        adminNote: reason,
      });
      toast.success("Đã từ chối yêu cầu nâng cấp");
      fetchRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Có lỗi xảy ra khi từ chối yêu cầu");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <UserCheck className="text-primary h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Phê Duyệt Nâng Cấp
            </h1>
            <p className="text-muted-foreground">
              Quản lý các yêu cầu nâng cấp tài khoản lên Seller
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>
            Xem và xử lý các yêu cầu nâng cấp từ người dùng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpgradeRequestFilters
            search={search}
            status={status}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusChange}
          />

          <UpgradeRequestTable
            requests={requests}
            isLoading={isLoading}
            onApprove={handleApproveConfirm}
            onReject={handleRejectConfirm}
          />

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from(
                  { length: Math.max(1, totalPages) },
                  (_, i) => i + 1
                ).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => handlePageChange(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(Math.max(1, totalPages), page + 1)
                      )
                    }
                    className={
                      page === Math.max(1, totalPages)
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
