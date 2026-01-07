"use client";

import type { UserReputationDistribution } from "@repo/shared-types";
import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: UserReputationDistribution;
}

const chartConfig = {
  excellent: {
    label: "Xuất sắc (≥90%)",
    color: "var(--color-emerald-500)",
  },
  good: {
    label: "Tốt (80-90%)",
    color: "var(--color-blue-500)",
  },
  average: {
    label: "Trung bình (70-80%)",
    color: "var(--color-amber-500)",
  },
  poor: {
    label: "Kém (<70%)",
    color: "var(--color-destructive)",
  },
  noRating: {
    label: "Chưa có đánh giá",
    color: "var(--muted)",
  },
} satisfies ChartConfig;

export function ReputationDistChart({ data }: Props) {
  const chartData = [
    {
      name: "excellent",
      value: data.excellent,
      label: "Xuất sắc",
      fill: chartConfig.excellent.color,
    },
    {
      name: "good",
      value: data.good,
      label: "Tốt",
      fill: chartConfig.good.color,
    },
    {
      name: "average",
      value: data.average,
      label: "Trung bình",
      fill: chartConfig.average.color,
    },
    {
      name: "poor",
      value: data.poor,
      label: "Kém",
      fill: chartConfig.poor.color,
    },
    {
      name: "noRating",
      value: data.noRating,
      label: "Chưa đánh giá",
      fill: chartConfig.noRating.color,
    },
  ].filter((item) => item.value > 0);

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="mx-auto h-[250px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => {
                  const percentage = ((Number(value) / total) * 100).toFixed(1);
                  return `${value} người (${percentage}%)`;
                }}
              />
            }
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          />
        </PieChart>
      </ChartContainer>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {chartData.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span className="flex-1 truncate">{item.label}</span>
              <span className="font-medium">
                {item.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
