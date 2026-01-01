import { Star, ShieldCheck } from "lucide-react";

import UserAvatar from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UserProfileSectionProps {
  user: {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    ratingScore: number;
    ratingCount: number;
    sellerExpireDate: Date | string | null;
    role: string | null;
  };
  className?: string;
}

const UserProfileSection = ({ user, className }: UserProfileSectionProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-none bg-linear-to-r from-slate-50 to-white shadow-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
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
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700"
                >
                  <ShieldCheck className="h-3 w-3" /> {user.role}
                </Badge>
              </div>

              <p className="font-medium text-slate-500">@{user.username}</p>

              <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-900">
                    {(user.ratingScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-slate-400">
                    ({user.ratingCount} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileSection;
