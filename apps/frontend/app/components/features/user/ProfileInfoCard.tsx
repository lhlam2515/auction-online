import type { PublicProfile } from "@repo/shared-types";
import {
  Calendar,
  Shield,
  Star,
  User as UserIcon,
  Gavel,
  Store,
} from "lucide-react";

import { UserAvatar } from "@/components/common";
import { RoleBadge } from "@/components/common/badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProfileInfoCardProps {
  profile: PublicProfile;
  summary: {
    positivePercentage?: number;
    totalRatings?: number;
    averageRating?: number;
  };
}

const ProfileInfoCard = ({ profile, summary }: ProfileInfoCardProps) => {
  const joinDate = new Date(profile.createdAt).toLocaleDateString("vi-VN");
  const ratingScore = profile.ratingScore ?? summary.averageRating ?? 0;
  const ratingCount = profile.ratingCount ?? summary.totalRatings ?? 0;

  // Rating is calculated as Average (-1 to 1) from 1 (Like) and -1 (Dislike)
  // Convert to Percentage (0-100%)
  const percentScore = ratingCount > 0 ? ((ratingScore + 1) / 2) * 100 : 0;

  // Logic from OrderSummaryCard for badge color
  let badgeColor = "border-red-500 bg-red-50 text-red-600";
  if (percentScore >= 80) {
    badgeColor = "border-green-300 bg-green-50 text-green-600";
  } else if (percentScore >= 50) {
    badgeColor = "border-amber-300 bg-amber-50 text-amber-600";
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserIcon className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <UserAvatar
            imageUrl={profile.avatarUrl}
            name={profile.fullName}
            className="h-26 w-26 border-2 border-white shadow-sm"
            fallbackClassName="text-3xl"
          />
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">
              {profile.fullName}
            </h3>
            <p className="text-sm text-gray-500">@{profile.username}</p>
          </div>
          <RoleBadge role={profile.role} className="px-3 py-1" />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" /> Đánh giá
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {ratingCount > 0 ? `${percentScore.toFixed(1)}%` : "Chưa có"}
              </span>
              <Badge variant="outline" className={cn("text-xs", badgeColor)}>
                {ratingCount} lượt
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" /> Tham gia
            </span>
            <span className="text-sm font-medium">{joinDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" /> Trạng thái
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              Verified
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Store className="h-4 w-4" /> Sản phẩm bán
            </span>
            <span className="text-sm font-medium">
              {profile.stats?.totalAuctionProducts || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Gavel className="h-4 w-4" /> Đã tham gia đấu giá
            </span>
            <span className="text-sm font-medium">
              {profile.stats?.totalBiddingProducts || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoCard;
