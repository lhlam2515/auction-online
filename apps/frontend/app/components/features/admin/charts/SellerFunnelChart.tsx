"use client";

import type { SellerUpgradeFunnel } from "@repo/shared-types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: SellerUpgradeFunnel;
}

const chartConfig = {
  count: {
    label: "Số lượng",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SellerFunnelChart({ data }: Props) {
  const chartData = [
    {
      stage: "Tổng bidder",
      count: data.totalBidders,
      color: "hsl(var(--chart-1))",
    },
    {
      stage: "Đã gửi yêu cầu",
      count: data.requestsSent,
      color: "hsl(var(--chart-2))",
    },
    {
      stage: "Đang chờ",
      count: data.requestsPending,
      color: "hsl(var(--chart-3))",
    },
    {
      stage: "Đã duyệt",
      count: data.requestsApproved,
      color: "hsl(var(--chart-4))",
    },
    {
      stage: "Bị từ chối",
      count: data.requestsRejected,
      color: "hsl(var(--destructive))",
    },
  ];

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer layout="vertical">
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="stage"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="bg-muted/50 rounded-lg border p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Tỷ lệ chuyển đổi</p>
          <p className="text-primary text-3xl font-bold">
            {data.conversionRate.toFixed(2)}%
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            ({data.requestsApproved} / {data.totalBidders} bidders)
          </p>
        </div>
      </div>
    </div>
  );
}
