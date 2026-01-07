import type { RatingWithUsers } from "@repo/shared-types";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import UserAvatar from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

type FeedbackCardProps = {
  feedback: RatingWithUsers;
  title: string;
  isSent: boolean;
};

const FeedbackCard = ({ feedback, title, isSent }: FeedbackCardProps) => {
  const displayUser = isSent ? feedback.receiver : feedback.sender;
  const isPositive = feedback.score === 1;
  return (
    <Card
      className={cn("gap-2", {
        "border-emerald-500/20 bg-emerald-500/10": isPositive && !isSent,
        "border-destructive/20 bg-destructive/10": !isPositive && !isSent,
      })}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <Badge
            className={cn(
              "flex items-center gap-1.5",
              isPositive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            )}
          >
            {isPositive ? (
              <ThumbsUp className="h-4 w-4" />
            ) : (
              <ThumbsDown className="h-4 w-4" />
            )}
            <span>{isPositive ? "Tích cực" : "Tiêu cực"}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start gap-3">
          <UserAvatar
            name={displayUser.fullName}
            imageUrl={displayUser.avatarUrl}
            className="h-10 w-10"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{displayUser.fullName}</p>
            {feedback.comment && (
              <p className="text-muted-foreground mt-2 text-sm">
                {feedback.comment}
              </p>
            )}
            <p className="text-muted-foreground mt-2 text-xs">
              {formatDate(new Date(feedback.createdAt))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
