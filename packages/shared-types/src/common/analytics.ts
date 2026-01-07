// Analytics types for charts and data visualization

export interface ChartDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  value: number;
}

export interface AnalyticsTimeRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface SpendingAnalytics {
  data: ChartDataPoint[];
  totalSpending: number;
  period: "7d" | "30d" | "12m";
}

export interface RevenueAnalytics {
  data: ChartDataPoint[];
  totalRevenue: number;
  period: "7d" | "30d" | "12m";
}
