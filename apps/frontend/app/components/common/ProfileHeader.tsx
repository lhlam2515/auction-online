import { Star } from "lucide-react";
import React from "react";

import UserAvatar from "@/components/common/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProfileHeaderProps {
  user: {
    fullName: string;
    username: string;
    avatarUrl: string | null;
    ratingScore: number;
    ratingCount: number;
  };
  badges?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

const ProfileHeader = ({
  user,
  badges,
  rightContent,
  className,
}: ProfileHeaderProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-none bg-linear-to-r from-slate-50 to-white shadow-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: User Info */}
          <div className="flex items-start gap-4">
            <UserAvatar
              name={user.fullName}
              imageUrl={user.avatarUrl}
              className="h-26 w-26 border-2 border-white shadow-sm"
              fallbackClassName="text-3xl"
            />

            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {user.fullName}
                </h3>
                {badges}
              </div>

              <p className="font-medium text-slate-500">@{user.username}</p>

              <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-900">
                    {user.ratingCount > 0
                      ? `${(((user.ratingScore + 1) / 2) * 100).toFixed(1)}%`
                      : "Chưa có đánh giá"}
                  </span>
                  <span className="text-slate-400">
                    ({user.ratingCount} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Optional Content */}
          {rightContent && (
            <div className="flex flex-col items-end gap-4 lg:min-w-[250px] lg:border-l lg:pl-6">
              {rightContent}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
