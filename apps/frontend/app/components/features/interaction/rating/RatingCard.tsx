import type { RatingWithUsers } from "@repo/shared-types";
import { UserIcon } from "lucide-react";

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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {r.sender?.avatarUrl ? (
              <img
                src={r.sender.avatarUrl}
                alt={r.sender.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {r.sender?.fullName || "Người dùng ẩn danh"}
              </h4>
              <span className="text-muted-foreground text-xs">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isPositive ? "default" : "destructive"}
                className={cn(
                  "px-1.5 py-0.5 text-xs",
                  isPositive
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                {isPositive ? "Tích cực" : "Tiêu cực"}
              </Badge>
              {/* Star icons logic could go here */}
            </div>
            <p className="mt-2 text-sm text-gray-700">
              {r.comment || "Không có nhận xét"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingCard;
