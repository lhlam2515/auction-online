"use client";

import type { TransactionPipeline } from "@repo/shared-types";
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
  data: TransactionPipeline;
}

const chartConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "var(--color-amber-500)",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "var(--color-purple-500)",
  },
  shipped: {
    label: "Đang giao",
    color: "var(--color-blue-500)",
  },
  completed: {
    label: "Hoàn thành",
    color: "var(--color-emerald-500)",
  },
  cancelled: {
    label: "Đã hủy",
    color: "var(--color-red-500)",
  },
} satisfies ChartConfig;

export function TransactionPipelineChart({ data }: Props) {
  const chartData = [
    {
      name: "Trạng thái đơn hàng",
      pending: data.pending,
      confirmed: data.confirmed,
      shipped: data.shipped,
      completed: data.completed,
      cancelled: data.cancelled,
    },
  ];

  const total =
    data.pending +
    data.confirmed +
    data.shipped +
    data.completed +
    data.cancelled;

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="pending"
            stackId="a"
            fill="var(--color-pending)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="confirmed"
            stackId="a"
            fill="var(--color-confirmed)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="shipped"
            stackId="a"
            fill="var(--color-shipped)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="completed"
            stackId="a"
            fill="var(--color-completed)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="cancelled"
            stackId="a"
            fill="var(--color-cancelled)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-muted/50 rounded-lg border p-3 text-center">
          <p className="text-muted-foreground">Tổng đơn</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-muted/50 rounded-lg border p-3 text-center">
          <p className="text-muted-foreground">Hoàn thành</p>
          <p className="text-2xl font-bold text-green-600">{data.completed}</p>
        </div>
        <div className="bg-muted/50 rounded-lg border p-3 text-center">
          <p className="text-muted-foreground">Đã hủy</p>
          <p className="text-2xl font-bold text-red-600">{data.cancelled}</p>
        </div>
      </div>
    </div>
  );
}
