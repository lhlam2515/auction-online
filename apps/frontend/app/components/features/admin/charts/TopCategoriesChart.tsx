"use client";

import type { TopCategory } from "@repo/shared-types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: TopCategory[];
}

const chartConfig = {
  activeCount: {
    label: "Đang hoạt động",
    color: "hsl(var(--chart-1))",
  },
  completedCount: {
    label: "Đã hoàn thành",
    color: "hsl(var(--chart-2))",
  },
  productCount: {
    label: "Tổng số",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function TopCategoriesChart({ data }: Props) {
  const chartData = data.map((item) => ({
    category: item.categoryName,
    activeCount: item.activeCount,
    completedCount: item.completedCount,
    productCount: item.productCount,
  }));

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            value.length > 10 ? value.slice(0, 10) + "..." : value
          }
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="activeCount"
          fill="var(--color-activeCount)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="completedCount"
          fill="var(--color-completedCount)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
