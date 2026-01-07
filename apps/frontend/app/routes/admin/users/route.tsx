import type {
  AccountStatus,
  AdminUserListItem,
  GetUsersParams,
  UserRole,
} from "@repo/shared-types";
import { Users } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { PaginationBar } from "@/components/common";
import {
  AdminUserSearchBar,
  AdminUserTable,
  CreateUserDialog,
} from "@/components/features/admin/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

const PER_PAGE = 10;

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản Lý Người Dùng - Online Auction" },
    {
      name: "description",
      content: "Trang quản lý người dùng cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export default function ManageUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for users
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState("");

  // Get URL params
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role") || "all";
  const accountStatus = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = searchParams.get("page") || "1";

  // Prepare query params for API
  const query: GetUsersParams = useMemo(() => {
    return {
      q: q || undefined,
      role: role && role !== "all" ? (role as UserRole) : undefined,
      accountStatus:
        accountStatus && accountStatus !== "all"
          ? (accountStatus as AccountStatus)
          : undefined,
      sortBy: (sortBy as GetUsersParams["sortBy"]) || "createdAt",
      sortOrder: (sortOrder as GetUsersParams["sortOrder"]) || "desc",
      page: parseInt(page, 10) || 1,
      limit: PER_PAGE,
    };
  }, [q, role, accountStatus, sortBy, sortOrder, page]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      setErrorUsers("");
      const response = await api.admin.users.getAll(query);
      if (response.success) {
        setUsers(response.data?.items || []);
        setTotalUsers(response.data?.pagination.total || 0);
        setTotalPages(response.data?.pagination.totalPages || 1);
      }
    } catch (error) {
      setErrorUsers(
        error instanceof Error ? error.message : "Lỗi khi tải người dùng"
      );
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi tải người dùng"
      );
    } finally {
      setIsLoadingUsers(false);
    }
  }, [query]);

  // Fetch users on query change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const onRoleChange = (newRole: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    if (newRole && newRole !== "all") {
      next.set("role", newRole);
    } else {
      next.delete("role");
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

  const onSortByChange = (newSortBy: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    next.set("sortBy", newSortBy);
    setSearchParams(next);
  };

  const onSortOrderChange = (newSortOrder: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    next.set("sortOrder", newSortOrder);
    setSearchParams(next);
  };

  const onPageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", newPage.toString());
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quản lý người dùng</CardTitle>
              <CardDescription className="text-lg">
                Xem và quản lý tất cả người dùng trên hệ thống
              </CardDescription>
            </div>

            {/* Create User Button */}
            <div className="ml-auto flex justify-end">
              <CreateUserDialog onSuccess={fetchUsers} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <AdminUserSearchBar
            searchQuery={q}
            roleFilter={role}
            statusFilter={accountStatus}
            sortBy={sortBy}
            sortOrder={sortOrder}
            totalUsers={totalUsers}
            onSearchChange={onSearchChange}
            onRoleChange={onRoleChange}
            onStatusChange={onStatusChange}
            onSortByChange={onSortByChange}
            onSortOrderChange={onSortOrderChange}
          />

          {/* Users Table */}
          {errorUsers ? (
            <p className="text-destructive text-center">{errorUsers}</p>
          ) : (
            <AdminUserTable
              users={users}
              loading={isLoadingUsers}
              onRefresh={fetchUsers}
            />
          )}

          {/* Pagination */}
          {!isLoadingUsers && !errorUsers && totalPages > 1 && (
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
