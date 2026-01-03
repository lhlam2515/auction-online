"use client";

import type { SellerUpgradeFunnel } from "@repo/shared-types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  totalBidders: {
    label: "Tổng bidder",
    color: "var(--color-slate-500)",
  },
  requestsSent: {
    label: "Đã gửi yêu cầu",
    color: "var(--color-blue-500)",
  },
  requestsPending: {
    label: "Đang chờ",
    color: "var(--color-amber-500)",
  },
  requestsApproved: {
    label: "Đã duyệt",
    color: "var(--color-emerald-500)",
  },
  requestsRejected: {
    label: "Bị từ chối",
    color: "var(--color-red-500)",
  },
} satisfies ChartConfig;

export function SellerFunnelChart({ data }: Props) {
  const chartData = [
    {
      stage: "Tổng bidder",
      count: data.totalBidders,
      fill: "var(--color-totalBidders)",
    },
    {
      stage: "Đã gửi yêu cầu",
      count: data.requestsSent,
      fill: "var(--color-requestsSent)",
    },
    {
      stage: "Đang chờ",
      count: data.requestsPending,
      fill: "var(--color-requestsPending)",
    },
    {
      stage: "Đã duyệt",
      count: data.requestsApproved,
      fill: "var(--color-requestsApproved)",
    },
    {
      stage: "Bị từ chối",
      count: data.requestsRejected,
      fill: "var(--color-requestsRejected)",
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
          <Bar dataKey="count" radius={[0, 4, 4, 0]} />
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
