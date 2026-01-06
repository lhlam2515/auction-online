import type { PublicProfile } from "@repo/shared-types";
import {
  Calendar,
  MessageCircle,
  Shield,
  Star,
  User as UserIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  // Logic from OrderSummaryCard for badge color
  let badgeColor = "border-red-500 bg-red-50 text-red-600";
  if (ratingScore >= 4.0) {
    badgeColor = "border-green-300 bg-green-50 text-green-600";
  } else if (ratingScore >= 2.5) {
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
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-200 p-1">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
                <UserIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">
              {profile.fullName}
            </h3>
            <p className="text-sm text-gray-500">@{profile.username}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {profile.role}
          </Badge>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" /> Đánh giá
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{ratingScore.toFixed(1)}/5.0</span>
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
        </div>

        <div className="pt-2">
          <Button className="w-full" variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Nhắn tin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoCard;
