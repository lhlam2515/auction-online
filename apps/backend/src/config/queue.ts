import { Queue } from "bullmq";
import { config } from "dotenv";
import IORedis from "ioredis";

import logger from "./logger";

config({ path: ".env" });

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

// Cấu hình TLS: mặc định bật xác thực chứng chỉ (secure) cho production
// Có thể tắt bằng cách set REDIS_TLS_REJECT_UNAUTHORIZED=false cho môi trường dev/test
const rejectUnauthorized =
  process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== "false";

// Thiết lập kết nối Redis sử dụng ioredis
const connection = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null, // Bắt buộc với BullMQ
  enableReadyCheck: false,

  // Tối ưu mạng
  family: 4, // Chỉ dùng IPv4, tránh tốn thời gian lookup IPv6
  keepAlive: 10000, // 10s mới ping giữ kết nối 1 lần (mặc định thấp hơn)
  lazyConnect: true, // Chỉ kết nối khi thực sự cần dùng

  // Cấu hình bảo mật cho Upstash
  tls: {
    rejectUnauthorized,
  },

  // Chiến lược kết nối lại thông minh (Backoff)
  // Nếu mất mạng, đợi lâu hơn chút rồi mới thử lại để tránh spam lệnh connect
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000); // Tối đa 3s
    return delay;
  },
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

export const defaultQueueOptions = {
  connection,
  defaultJobOptions: {
    removeOnComplete: true, // Xóa job ngay khi xong -> Giảm dung lượng lưu trữ
    removeOnFail: 100, // Chỉ giữ lại 100 job lỗi để debug
    attempts: 3, // Thử lại tối đa 3 lần
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
};

// Khởi tạo các Queue (Producer Side)
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, defaultQueueOptions);
export const auctionTimerQueue = new Queue(
  QUEUE_NAMES.AUCTION_TIMER,
  defaultQueueOptions
);
export const autoBidQueue = new Queue(
  QUEUE_NAMES.AUTO_BID,
  defaultQueueOptions
);

// Export connection để dùng cho Worker (Consumer Side)
export const redisConnection = connection;
