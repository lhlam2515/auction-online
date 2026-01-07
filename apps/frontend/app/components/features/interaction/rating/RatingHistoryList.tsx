import type { RatingWithUsers } from "@repo/shared-types";
import { MessageSquare, Star } from "lucide-react";

import { AppEmptyState } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import RatingCard from "./RatingCard";

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
          <AppEmptyState
            icon={<Star />}
            title="Chưa có đánh giá nào"
            description="Lịch sử đánh giá của người dùng này hiện đang trống."
            className="min-h-[200px]"
          />
        ) : (
          <div className="space-y-4">
            {ratings.map((rating, index) => (
              <div key={rating.id}>
                <RatingCard
                  rating={rating}
                  timeFormat="relative"
                  className="shadow-none"
                />
                {index < ratings.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RatingHistoryList;
