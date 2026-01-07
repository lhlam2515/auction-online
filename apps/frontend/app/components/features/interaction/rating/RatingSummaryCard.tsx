import type { RatingSummary } from "@repo/shared-types";
import { ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RatingSummaryCardProps {
  summary: RatingSummary;
  className?: string;
}

const RatingSummaryCard = ({ summary, className }: RatingSummaryCardProps) => {
  const { positiveCount, negativeCount, totalRatings, positivePercentage } =
    summary;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="text-primary h-5 w-5" />
          Tổng quan đánh giá
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total ratings */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Tổng số đánh giá
          </span>
          <Badge variant="secondary" className="text-base font-semibold">
            {totalRatings}
          </Badge>
        </div>

        {/* Positive percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Tỉ lệ đánh giá tích cực
            </span>
            <span className="text-lg font-bold text-emerald-600">
              {positivePercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={positivePercentage} className="h-2" />
        </div>

        {/* Positive vs Negative counts */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-muted/50 flex flex-col items-center gap-2 rounded-lg p-3">
            <ThumbsUp className="h-5 w-5 text-emerald-600" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {positiveCount}
              </p>
              <p className="text-muted-foreground text-xs">Tích cực</p>
            </div>
          </div>

          <div className="bg-muted/50 flex flex-col items-center gap-2 rounded-lg p-3">
            <ThumbsDown className="text-destructive h-5 w-5" />
            <div className="text-center">
              <p className="text-destructive text-2xl font-bold">
                {negativeCount}
              </p>
              <p className="text-muted-foreground text-xs">Tiêu cực</p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {totalRatings === 0 && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Chưa có đánh giá nào
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RatingSummaryCard;
