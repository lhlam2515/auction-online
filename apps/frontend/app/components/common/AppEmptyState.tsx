import type { ReactNode } from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface AppEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const AppEmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: AppEmptyStateProps) => {
  return (
    <Empty
      className={cn(
        "bg-muted/30 from-muted/20 to-background min-h-[300px] border-2 border-dashed bg-linear-to-b",
        className
      )}
    >
      <EmptyHeader>
        {icon ? (
          <EmptyMedia
            variant="icon"
            className="bg-muted/80 size-16 rounded-full [&_svg]:size-8"
          >
            {icon}
          </EmptyMedia>
        ) : null}
        <EmptyTitle className="text-xl font-semibold text-balance">
          {title}
        </EmptyTitle>
        {description && (
          <EmptyDescription className="max-w-sm text-balance">
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {action && <EmptyContent className="mt-2">{action}</EmptyContent>}
    </Empty>
  );
};

export default AppEmptyState;
