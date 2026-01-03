"use client";

import type { AuctionHealthStats } from "@repo/shared-types";
import { Pie, PieChart, Cell } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

interface Props {
  stats: AuctionHealthStats;
}

export function AuctionSuccessGauge({ stats }: Props) {
  const successRate = stats.successRate;

  const data = [
    { name: "Success", value: successRate },
    { name: "Remaining", value: 100 - successRate },
  ];

  const getColors = (rate: number): [string, string] => {
    if (rate >= 80) return ["hsl(var(--chart-2))", "hsl(var(--muted))"];
    if (rate >= 60) return ["hsl(var(--chart-4))", "hsl(var(--muted))"];
    return ["hsl(var(--destructive))", "hsl(var(--muted))"];
  };

  const colors = getColors(successRate);

  const chartConfig = {
    success: {
      label: "Thành công",
      color: colors[0],
    },
    remaining: {
      label: "Còn lại",
      color: colors[1],
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-4">
      <div className="relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[200px] w-[200px]"
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold">{successRate.toFixed(1)}%</div>
            <div className="text-muted-foreground text-sm">
              Tỷ lệ thành công
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Tổng số đấu giá</p>
          <p className="text-2xl font-bold">{stats.totalCompleted}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Thành công</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.successfulAuctions}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Thất bại</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.failedAuctions}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Trung bình bid/sản phẩm</p>
          <p className="text-2xl font-bold">
            {stats.averageBidsPerProduct.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
