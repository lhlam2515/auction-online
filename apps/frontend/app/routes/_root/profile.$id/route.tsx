import type { PublicProfile, RatingWithUsers } from "@repo/shared-types";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

import { RatingHistoryPanel } from "@/components/features/interaction";
import { ProfileInfoCard } from "@/components/features/user";
import { Spinner } from "@/components/ui/spinner";
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

export default function PublicProfilePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile>();
  const [ratings, setRatings] = useState<RatingWithUsers[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const page = Number(searchParams.get("page")) || 1;
  const filter = searchParams.get("filter") || "all";
  const limit = 5;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        const [profileRes, ratingsRes] = await Promise.all([
          api.users.getPublicProfile(id),
          api.ratings.getByUser(id, {
            limit,
            page,
          }),
        ]);

        if (isMounted) {
          if (profileRes.success) {
            setProfile(profileRes.data);
          } else {
            toast.error(profileRes.error?.message || "User not found");
          }

          if (ratingsRes.success) {
            setRatings(ratingsRes.data.items as unknown as RatingWithUsers[]);
            setPagination({
              page: ratingsRes.data.pagination.page,
              limit: ratingsRes.data.pagination.limit,
              total: ratingsRes.data.pagination.total,
              totalPages: ratingsRes.data.pagination.totalPages,
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch data:", error);
          toast.error("Đã có lỗi xảy ra khi tải dữ liệu");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, page]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  const handleFilterChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("filter", value);
      prev.set("page", "1"); // Reset to page 1 on filter change
      return prev;
    });
  };

  // Client-side filtering as fallback/temporary measure
  const filteredRatings = ratings.filter((rating) => {
    if (filter === "all") return true;
    if (filter === "positive") return rating.score === 1;
    if (filter === "negative") return rating.score === -1;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 text-center text-red-500">
        Không tìm thấy thông tin người dùng
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Sidebar - Profile Info */}
        <div className="md:col-span-4 lg:col-span-3">
          <ProfileInfoCard
            profile={profile}
            summary={{
              averageRating: profile.ratingScore,
              totalRatings: profile.ratingCount,
            }}
          />
        </div>

        {/* Right Content - Ratings List */}
        <div className="md:col-span-8 lg:col-span-9">
          <RatingHistoryPanel
            ratings={filteredRatings}
            total={pagination?.total || ratings.length}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  );
}
