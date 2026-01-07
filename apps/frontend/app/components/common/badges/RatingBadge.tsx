import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  score: number; // Rating score between 0 and 1
  count?: number; // Number of ratings
  className?: string;
}

const RatingBadge = ({ score, count, className }: RatingBadgeProps) => {
  const percentage = (score * 100).toFixed(1);

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-amber-500/20 bg-amber-500/10 px-2 py-1",
        className
      )}
    >
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-amber-600">
        {percentage}%
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground text-sm">
          ({count} đánh giá)
        </span>
      )}
    </Badge>
  );
};

export default RatingBadge;
