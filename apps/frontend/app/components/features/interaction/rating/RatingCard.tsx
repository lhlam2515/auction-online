import type { RatingWithUsers } from "@repo/shared-types";
import { UserIcon, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Local definition to handle type mismatch if shared-types is out of sync
export interface RatingDisplay extends Omit<RatingWithUsers, "sender"> {
  sender: {
    fullName: string;
    avatarUrl?: string | null;
  };
}

interface RatingCardProps {
  rating: RatingWithUsers | RatingDisplay;
  isPositive?: boolean; // Allow overriding logic
}

const RatingCard = ({ rating }: RatingCardProps) => {
  // Cast to any to avoid "Property sender does not exist" if types are mismatched
  const r = rating as any;
  const isPositive = r.score === 1; // Assuming 1 is positive, -1 negative based on shared-types
  const date = new Date(r.createdAt).toLocaleDateString("vi-VN");

  return (
    <Card
      className={cn(
        "border-l-4",
        isPositive ? "border-l-green-600" : "border-l-red-600"
      )}
    >
      <CardContent className="px-4 py-2.5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <Link to={`/profile/${r.senderId}`} className="block">
              {r.sender?.avatarUrl ? (
                <img
                  src={r.sender.avatarUrl}
                  alt={r.sender.fullName}
                  className="h-10 w-10 rounded-full object-cover transition-opacity hover:opacity-80"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </Link>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">
                  <Link
                    to={`/profile/${r.senderId}`}
                    className="hover:underline"
                  >
                    {r.sender?.fullName || "Người dùng ẩn danh"}
                  </Link>
                </h4>
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 text-[10px]",
                    isPositive
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {isPositive ? (
                    <ThumbsUp className="h-3 w-3" />
                  ) : (
                    <ThumbsDown className="h-3 w-3" />
                  )}
                  {isPositive ? "Tích cực" : "Tiêu cực"}
                </Badge>
              </div>
              <span className="text-muted-foreground text-xs">{date}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700">
              {r.comment || "Không có nhận xét"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingCard;
