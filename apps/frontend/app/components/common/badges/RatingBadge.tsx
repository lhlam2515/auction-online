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
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-yellow-100 bg-yellow-50 px-2 py-1",
        className
      )}
    >
      <Star className="fill-yellow-400 text-yellow-400" />
      <span className="text-accent text-sm font-semibold">{percentage}%</span>
      {count !== undefined && (
        <span className="text-muted-foreground text-sm">
          ({count} đánh giá)
        </span>
      )}
    </Badge>
  );
};

export default RatingBadge;
