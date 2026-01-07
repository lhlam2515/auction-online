import type { RatingWithUsers } from "@repo/shared-types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { Link } from "react-router";

import { UserAvatar } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/routes";
import { cn, formatDate } from "@/lib/utils";

export interface RatingCardProps {
  rating: RatingWithUsers;
  isSent?: boolean;
  title?: string;
  className?: string;
  timeFormat?: "relative" | "absolute";
  variant?: "default" | "bordered";
}

const RatingCard = ({
  rating,
  isSent = false,
  title,
  className,
  timeFormat = "absolute",
  variant = "default",
}: RatingCardProps) => {
  const displayUser = isSent ? rating.receiver : rating.sender;
  const displayUserId = isSent ? rating.receiverId : rating.senderId;
  const isPositive = rating.score === 1;

  if (!displayUser || !displayUserId) return null;

  const displayTime =
    timeFormat === "relative"
      ? formatDistanceToNow(new Date(rating.createdAt), {
          addSuffix: true,
          locale: vi,
        })
      : formatDate(new Date(rating.createdAt));

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        variant === "bordered" && {
          "border-l-4 border-l-emerald-500": isPositive,
          "border-l-destructive border-l-4": !isPositive,
        },
        variant === "default" && {
          "border-emerald-500/10 bg-emerald-500/5": isPositive && !isSent,
          "bg-destructive/5 border-destructive/10": !isPositive && !isSent,
        },
        className
      )}
    >
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex gap-4", title && "pt-0")}>
        <Link
          to={APP_ROUTES.PROFILE(displayUserId)}
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <UserAvatar
            name={displayUser.fullName}
            imageUrl={displayUser.avatarUrl}
            className="h-10 w-10"
          />
        </Link>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={APP_ROUTES.PROFILE(displayUserId)}
                className="hover:text-primary transition-colors"
              >
                <p className="truncate text-sm font-semibold">
                  {displayUser.fullName}
                </p>
              </Link>
              <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3" />
                <span>{displayTime}</span>
              </div>
            </div>

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

          {rating.comment && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm leading-relaxed">{rating.comment}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingCard;
