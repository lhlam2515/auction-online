import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  description?: string;
}

const StatsCard = ({
  title,
  value,
  icon,
  iconColor,
  bgColor,
  description,
}: StatsCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <div
          className={cn("bg-opacity-10 rounded-full p-2.5", bgColor, iconColor)}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-card-foreground text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
