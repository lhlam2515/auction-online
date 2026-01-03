"use client";

import type { BidDensity } from "@repo/shared-types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: BidDensity[];
}

const chartConfig = {
  bidCount: {
    label: "Số lượt bid",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BidDensityChart({ data }: Props) {
  const chartData = data.map((item) => ({
    product:
      item.productName.length > 15
        ? item.productName.slice(0, 15) + "..."
        : item.productName,
    fullName: item.productName,
    bidCount: item.bidCount,
    startPrice: item.startPrice,
    finalPrice: item.finalPrice,
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
          dataKey="product"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
        <Bar
          dataKey="bidCount"
          fill="var(--color-bidCount)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
