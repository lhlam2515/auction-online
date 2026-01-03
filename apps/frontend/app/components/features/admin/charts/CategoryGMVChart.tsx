"use client";

import type { CategoryGMV } from "@repo/shared-types";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils";

interface Props {
  data: CategoryGMV[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CategoryGMVChart({ data }: Props) {
  const chartConfig = data.reduce((config, item, index) => {
    config[item.categoryId] = {
      label: item.categoryName,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as ChartConfig);

  const chartData = data.map((item, index) => ({
    category: item.categoryId,
    categoryName: item.categoryName,
    value: item.gmv,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.categoryName || value;
                  }}
                  formatter={(value) => formatPrice(Number(value))}
                />
              }
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ categoryName, percentage }) =>
                `${categoryName}: ${percentage.toFixed(1)}%`
              }
              outerRadius={100}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={item.categoryId} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{item.categoryName}</span>
            <span className="ml-auto font-medium">{formatPrice(item.gmv)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
