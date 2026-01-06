import type { RatingWithUsers } from "@repo/shared-types";
import { Package } from "lucide-react";

import { RatingCard, RatingInfo } from "@/components/features/interaction";
import { ProfileInfoCard } from "@/components/features/user";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("User ID is required", { status: 400 });
  }

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
    try {
      // Assuming getByUser returns PaginatedResponse<Rating>
      // We are casting it to any to bypass strict type check if RatingWithUsers is expected
      // but api returns Rating. In reality RatingWithUsers is needed for UI.
      // Ideally the API should return RatingWithUsers.
      const ratingsRes = await api.ratings.getByUser(id, { limit: 50 });
      if (ratingsRes.success) {
        ratings = ratingsRes.data.items as unknown as RatingWithUsers[];
      }
    } catch (e) {
      console.error("Failed to fetch ratings or not implemented:", e);
    }

    return { profile, ratingSummary, ratings };
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
  const { profile, ratings, ratingSummary } = loaderData;

  // Mock filtering since we don't have real role data in Rating entity yet
  // In a real app, we would filter by rating.role === 'SELLER' or 'BIDDER'
  // For now, we'll display the same list or split arbitrarily if we could.
  const sellerRatings = ratings;
  const bidderRatings = ratings;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Sidebar - Profile Info */}
        <div className="md:col-span-4 lg:col-span-3">
          <ProfileInfoCard profile={profile} summary={ratingSummary} />
        </div>

        {/* Right Content - Ratings Tabs */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="h-full border-none bg-transparent shadow-none">
            <Tabs defaultValue="seller" className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Lịch sử đánh giá</h2>
                <TabsList>
                  <TabsTrigger value="seller">Là Người Bán</TabsTrigger>
                  <TabsTrigger value="bidder">Là Người Mua</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="seller" className="space-y-4">
                {sellerRatings.length > 0 ? (
                  sellerRatings.map((rating) => (
                    <RatingCard key={rating.id} rating={rating} />
                  ))
                ) : (
                  <div className="text-muted-foreground rounded-lg border border-dashed bg-white py-10 text-center">
                    <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />
                    Chưa có đánh giá nào với vai trò người bán
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bidder" className="space-y-4">
                {bidderRatings.length > 0 ? (
                  bidderRatings.map((rating) => (
                    <RatingCard key={rating.id} rating={rating} />
                  ))
                ) : (
                  <div className="text-muted-foreground rounded-lg border border-dashed bg-white py-10 text-center">
                    <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />
                    Chưa có đánh giá nào với vai trò người mua
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
