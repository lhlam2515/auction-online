import { z } from "zod";

export const analyticsPeriodSchema = z.object({
  period: z
    .enum(["7d", "30d", "12m"], {
      message: "Period must be one of: 7d, 30d, 12m",
    })
    .default("30d"),
});
