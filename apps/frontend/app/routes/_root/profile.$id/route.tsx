import type { RatingWithUsers } from "@repo/shared-types";
import { Package } from "lucide-react";
import { Fragment, useState } from "react";

import { RatingCard } from "@/components/features/interaction";
import { ProfileInfoCard } from "@/components/features/user";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hồ sơ người dùng - Online Auction" },
    {
      name: "description",
      content: "Thông tin và đánh giá người dùng",
    },
  ];
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("User ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 5; // Use smaller limit for testing pagination

  try {
    // Parallel fetching for profile and ratings
    // Note: In a real implementation with working backend, we would fetch ratings here
    // filtered by role if supported, or fetch all and filter client side.
    const [profileRes, ratingSummaryRes] = await Promise.all([
      api.users.getPublicProfile(id),
      api.users.getRatingSummary(id),
    ]);

    if (!profileRes.success) {
      throw new Response(profileRes.error.message || "User not found", {
        status: 404,
      });
    }

    const profile = profileRes.data;
    const ratingSummary = ratingSummaryRes.success
      ? ratingSummaryRes.data
      : { expectedRating: 0, totalRatings: 0, averageRating: 0 }; // Default empty summary

    // Attempt to fetch ratings. If backend is not implemented, we might get an error
    // or empty list depending on implementation.
    // For now we will try to fetch and handle error gracefully.
    let ratings: RatingWithUsers[] = [];
    let pagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };

    try {
      // Assuming getByUser returns PaginatedResponse<Rating>
      // We are casting it to any to bypass strict type check if RatingWithUsers is expected
      // but api returns Rating. In reality RatingWithUsers is needed for UI.
      // Ideally the API should return RatingWithUsers.
      const ratingsRes = await api.ratings.getByUser(id, {
        limit,
        page,
      });
      if (ratingsRes.success) {
        ratings = ratingsRes.data.items as unknown as RatingWithUsers[];
        pagination = {
          page: ratingsRes.data.pagination.page,
          limit: ratingsRes.data.pagination.limit,
          total: ratingsRes.data.pagination.total,
          totalPages: ratingsRes.data.pagination.totalPages,
        };
      }
    } catch (e) {
      console.error("Failed to fetch ratings or not implemented:", e);
    }

    return { profile, ratingSummary, ratings, pagination };
  } catch (error) {
    console.error("Failed to load profile:", error);
    throw new Response("User not found or error loading profile", {
      status: 404,
    });
  }
}

export default function PublicProfilePage({
  loaderData,
}: Route.ComponentProps) {
  const { profile, ratings, ratingSummary, pagination } = loaderData;
  const [filter, setFilter] = useState<string>("all");

  const filteredRatings = ratings.filter((rating) => {
    if (filter === "all") return true;
    if (filter === "positive") return rating.score === 1;
    if (filter === "negative") return rating.score === -1;
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Sidebar - Profile Info */}
        <div className="md:col-span-4 lg:col-span-3">
          <ProfileInfoCard profile={profile} summary={ratingSummary} />
        </div>

        {/* Right Content - Ratings List */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="h-full border-none bg-transparent shadow-none">
            <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">
                Lịch sử đánh giá ({pagination?.total || ratings.length})
              </h2>

              <div className="flex items-center gap-2">
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value)}
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Lọc theo đánh giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đánh giá</SelectItem>
                    <SelectItem value="positive">Tích cực</SelectItem>
                    <SelectItem value="negative">Tiêu cực</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRatings.length > 0 ? (
                filteredRatings.map((rating) => (
                  <RatingCard key={rating.id} rating={rating} />
                ))
              ) : (
                <div className="text-muted-foreground rounded-lg border border-dashed bg-white py-10 text-center">
                  <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />
                  {filter === "all"
                    ? "Chưa có đánh giá nào"
                    : `Chưa có đánh giá ${filter === "positive" ? "tích cực" : "tiêu cực"} nào`}
                </div>
              )}
            </div>

            {pagination && pagination.totalPages > 0 && (
              <div className="mt-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={`?page=${Math.max(1, pagination.page - 1)}`}
                        className={
                          pagination.page <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 1
                      )
                      .map((page, i, arr) => {
                        const prev = arr[i - 1];
                        const showEllipsis = prev && page - prev > 1;

                        return (
                          <Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem>
                                <span className="text-muted-foreground flex h-9 w-9 items-center justify-center">
                                  ...
                                </span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href={`?page=${page}`}
                                isActive={page === pagination.page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </Fragment>
                        );
                      })}
                    <PaginationItem>
                      <PaginationNext
                        href={`?page=${Math.min(
                          pagination.totalPages,
                          pagination.page + 1
                        )}`}
                        className={
                          pagination.page >= pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
