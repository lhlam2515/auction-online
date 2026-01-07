import type { RatingWithUsers } from "@repo/shared-types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ThumbsUp, ThumbsDown, MessageSquare, Clock } from "lucide-react";

import { UserAvatar } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RatingHistoryListProps {
  ratings: RatingWithUsers[];
  isLoading?: boolean;
  className?: string;
}

const RatingHistoryList = ({
  ratings,
  isLoading = false,
  className,
}: RatingHistoryListProps) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="text-primary h-5 w-5" />
            Lịch sử đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center justify-center py-8">
            <span className="animate-pulse">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="text-primary h-5 w-5" />
          Lịch sử đánh giá
        </CardTitle>
        <CardDescription>
          Danh sách các đánh giá từ người mua và người bán
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ratings.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            Chưa có đánh giá nào
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating, index) => (
              <div key={rating.id}>
                <RatingItem rating={rating} />
                {index < ratings.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function RatingItem({ rating }: { rating: RatingWithUsers }) {
  const isPositive = rating.score === 1;
  const timeAgo = formatDistanceToNow(new Date(rating.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <UserAvatar
        imageUrl={rating.sender?.avatarUrl || undefined}
        name={rating.sender?.fullName || "Người dùng đã xóa"}
      />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">
              {rating.sender?.fullName || "Người dùng đã xóa"}
            </p>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Rating badge */}
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className={cn(
              "flex items-center gap-1",
              isPositive && "bg-emerald-600 px-2 text-white"
            )}
          >
            {isPositive ? (
              <>
                <ThumbsUp className="h-3 w-3" />
                Tích cực
              </>
            ) : (
              <>
                <ThumbsDown className="h-3 w-3" />
                Tiêu cực
              </>
            )}
          </Badge>
        </div>

        {/* Comment */}
        {rating.comment && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm leading-relaxed">{rating.comment}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RatingHistoryList;
