import React from "react";

import UserAvatar from "@/components/common/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { RatingBadge } from "./badges";

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
        "from-muted/50 to-background overflow-hidden border-none bg-linear-to-r shadow-sm",
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
              className="border-background h-26 w-26 border-2 shadow-sm"
              fallbackClassName="text-3xl"
            />

            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-2xl font-bold tracking-tight">
                  {user.fullName}
                </h3>
                {badges}
              </div>

              <p className="text-muted-foreground font-medium">
                @{user.username}
              </p>

              <RatingBadge score={user.ratingScore} count={user.ratingCount} />
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
