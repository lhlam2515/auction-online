"use client";

import type { CategoryGMV } from "@repo/shared-types";
import { Pie, PieChart } from "recharts";

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

const CHART_COLORS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
];

export function CategoryGMVChart({ data }: Props) {
  const chartConfig = data.reduce((config, item, index) => {
    config[item.categoryId] = {
      label: item.categoryName,
      color: `var(${CHART_COLORS[index % CHART_COLORS.length]})`,
    };
    return config;
  }, {} as ChartConfig);

  const chartData = data.map((item) => ({
    category: item.categoryId,
    categoryName: item.categoryName,
    value: item.gmv,
    percentage: item.percentage,
    fill: `var(--color-${item.categoryId})`,
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
          />
        </PieChart>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((item) => (
          <div key={item.categoryId} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor:
                  chartConfig[item.categoryId]?.color || "hsl(var(--muted))",
              }}
            />
            <span className="truncate">{item.categoryName}</span>
            <span className="ml-auto font-medium">{formatPrice(item.gmv)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
