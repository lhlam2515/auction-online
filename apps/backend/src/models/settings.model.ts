import { pgTable } from "drizzle-orm/pg-core";

export const auctionSettings = pgTable("auction_settings", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  extendThresholdMinutes: t
    .integer("extend_threshold_minutes")
    .notNull()
    .default(5),
  extendDurationMinutes: t
    .integer("extend_duration_minutes")
    .notNull()
    .default(10),
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}));
