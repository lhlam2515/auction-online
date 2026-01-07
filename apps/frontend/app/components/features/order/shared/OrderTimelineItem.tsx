import React from "react";

import { cn } from "@/lib/utils";

interface OrderTimelineItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
}

const OrderTimelineItem = ({
  icon: Icon,
  title,
  description,
  status,
}: OrderTimelineItemProps) => {
  const iconClasses = {
    completed: "bg-emerald-500",
    active: "bg-primary animate-pulse",
    pending: "bg-muted",
  };

  const textClasses = {
    completed: "text-foreground",
    active: "text-foreground",
    pending: "text-muted-foreground",
  };

  const lineClasses = {
    completed: "bg-emerald-500",
    active: "bg-muted",
    pending: "bg-muted",
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            iconClasses[status]
          )}
        >
          <Icon
            className={cn("h-4 w-4", {
              "text-muted-foreground": status === "pending",
              "text-white": status !== "pending",
            })}
          />
        </div>
        {status !== "pending" && (
          <div className={cn("h-12 w-0.5", lineClasses[status])} />
        )}
      </div>
      <div className="flex-1 pb-4">
        <p className={cn("font-medium", textClasses[status])}>{title}</p>
        <p className={cn("text-sm", textClasses[status])}>{description}</p>
      </div>
    </div>
  );
};

export default OrderTimelineItem;
