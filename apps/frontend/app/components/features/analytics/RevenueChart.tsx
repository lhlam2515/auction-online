import type { RevenueAnalytics } from "@repo/shared-types";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface RevenueChartProps {
  data: RevenueAnalytics;
  onPeriodChange: (period: "7d" | "30d" | "12m") => void;
  isLoading?: boolean;
}

const PERIOD_LABELS = {
  "7d": "7 ngày qua",
  "30d": "30 ngày qua",
  "12m": "12 tháng qua",
};

export function RevenueChart({
  data,
  onPeriodChange,
  isLoading = false,
}: RevenueChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "12m">(
    data.period
  );

  const handlePeriodChange = (period: "7d" | "30d" | "12m") => {
    setSelectedPeriod(period);
    onPeriodChange(period);
  };

  const formatXAxis = (value: string) => {
    if (data.period === "12m") {
      const [year, month] = value.split("-");
      return `${month}/${year.slice(2)}`;
    }
    const [, month, day] = value.split("-");
    return `${day}/${month}`;
  };

  const formatTooltipValue = (value: number) => {
    return formatPrice(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Biểu đồ doanh thu
            </CardTitle>
            <CardDescription>
              Tổng doanh thu: {formatPrice(data.totalRevenue)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {(["7d", "30d", "12m"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange(period)}
                disabled={isLoading}
              >
                {PERIOD_LABELS[period]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            Đang tải dữ liệu...
          </div>
        ) : data.data.length === 0 ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            Chưa có dữ liệu doanh thu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(value) => `${value / 1000}k`}
                className="text-xs"
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) => `Ngày: ${label}`}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
