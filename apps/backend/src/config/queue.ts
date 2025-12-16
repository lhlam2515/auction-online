import { Queue } from "bullmq";
import { config } from "dotenv";
import IORedis from "ioredis";

import logger from "./logger";

config({ path: ".env" });

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

// Thiết lập kết nối Redis sử dụng ioredis
const connection = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null, // Bắt buộc đối với BullMQ
  enableReadyCheck: false,
  tls: {
    rejectUnauthorized: false, // Cần thiết khi kết nối Upstash qua TLS
  },
  retryStrategy: (times) => Math.min(times * 50, 2000), // Reconnect thông minh
});

connection.on("connect", () => logger.info("✅ Connected to Upstash Redis"));
connection.on("error", (err) =>
  logger.error("❌ Redis Connection Error:", err)
);

// Định nghĩa tên các Queue
export const QUEUE_NAMES = {
  EMAIL: "email-queue",
  AUCTION_TIMER: "auction-timer-queue",
  AUTO_BID: "auto-bid-queue",
};

// Khởi tạo các Queue (Producer Side)
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, { connection });
export const auctionTimerQueue = new Queue(QUEUE_NAMES.AUCTION_TIMER, {
  connection,
});
export const autoBidQueue = new Queue(QUEUE_NAMES.AUTO_BID, { connection });

// Export connection để dùng cho Worker (Consumer Side)
export const redisConnection = connection;
