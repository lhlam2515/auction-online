"use client";

import type { BiddingActivity } from "@repo/shared-types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils";

interface Props {
  data: BiddingActivity[];
}

const chartConfig = {
  bidCount: {
    label: "Số lượt bid",
    color: "hsl(var(--chart-1))",
  },
  uniqueBidders: {
    label: "Người bid",
    color: "hsl(var(--chart-2))",
  },
  averageBidValue: {
    label: "Giá trị TB",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function BiddingActivityChart({ data }: Props) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "dd/MM", { locale: vi }),
    fullDate: format(new Date(item.date), "dd/MM/yyyy", { locale: vi }),
    bidCount: item.bidCount,
    uniqueBidders: item.uniqueBidders,
    averageBidValue: item.averageBidValue,
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
      <LineChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toString()}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatPrice(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => {
                const item = payload?.[0]?.payload;
                return item?.fullDate || value;
              }}
              formatter={(value, name) => {
                if (name === "averageBidValue") {
                  return formatPrice(Number(value));
                }
                return value;
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="bidCount"
          stroke="var(--color-bidCount)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="uniqueBidders"
          stroke="var(--color-uniqueBidders)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="averageBidValue"
          stroke="var(--color-averageBidValue)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ChartContainer>
  );
}
