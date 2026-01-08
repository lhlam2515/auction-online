import { Worker, Job, type WorkerOptions } from "bullmq";

import logger from "@/config/logger";
import { redisConnection, QUEUE_NAMES } from "@/config/queue";
import { auctionService } from "@/services/auction.service";
import { emailService } from "@/services/email.service";

// Khai báo biến global để quản lý worker
let emailWorker: Worker;
let auctionTimerWorker: Worker;
let autoBidWorker: Worker;

const workerConfig: WorkerOptions = {
  connection: redisConnection,

  // 1. QUAN TRỌNG NHẤT: Giảm tần suất check job treo
  // Mặc định 5000ms (5s) -> Tăng lên 60000ms (1 phút)
  // Giúp giảm số lệnh đi 12 lần!
  stalledInterval: 60000,

  // 2. Lock Duration phải luôn lớn hơn stalledInterval
  // Thời gian tối đa 1 job được phép chạy trước khi bị coi là treo
  lockDuration: 60000 * 2,

  // 3. Tắt Metrics (Thống kê)
  // Mặc định BullMQ ghi stats liên tục -> Tắt đi tiết kiệm cực nhiều
  metrics: {
    maxDataPoints: 0,
  },

  // 4. Giới hạn số lượng xử lý song song (Tùy server yếu hay mạnh)
  concurrency: 5,

  // 5. Khi hàng đợi rỗng, đợi bao lâu mới check tiếp? (Polling)
  // Tăng lên để worker không hỏi Redis liên tục khi không có việc
  drainDelay: 10000, // 10 giây
};

// Email Worker Config - Optimized for SendGrid HTTP API
const emailWorkerConfig: WorkerOptions = {
  connection: redisConnection,

  // SendGrid HTTP API nhanh hơn SMTP, không cần check treo thường xuyên
  stalledInterval: 60000,

  // Lock Duration cho email (20s là đủ cho HTTP API)
  lockDuration: 20000,

  // Tắt metrics để giảm Redis operations
  metrics: {
    maxDataPoints: 0,
  },

  // CONCURRENCY CAO: SendGrid HTTP API có thể xử lý nhiều request đồng thời
  // Tăng từ 20 (SMTP) lên 50 (HTTP API) để tận dụng tốc độ
  concurrency: 50,

  // Khi hết email, check lại sau 3s (nhanh hơn vì API nhanh)
  drainDelay: 3000,

  // Rate limiting: SendGrid cho phép burst cao hơn SMTP
  // Free tier: 100 emails/day
  // Essentials: 100 emails/second
  // Pro/Premier: Unlimited (với rate limit thấp)
  limiter: {
    max: 5, // Tối đa 5 emails
    duration: 60000, // Trong 1 phút
  },
};

export const startWorkers = () => {
  if (emailWorker && auctionTimerWorker && autoBidWorker) return; // Tránh khởi tạo 2 lần

  logger.info("⚙️ Starting Background Workers...");

  // 1. EMAIL WORKER - Optimized for high throughput
  emailWorker = new Worker(
    QUEUE_NAMES.EMAIL,
    async (job: Job) => {
      const { to, subject, html } = job.data;

      try {
        await emailService.processEmailJob(to, subject, html);
        logger.debug(`✉️ Email job #${job.id} completed successfully`);
      } catch (error) {
        logger.error(`❌ Email job #${job.id} failed:`, error);
        throw error; // Ném lỗi để BullMQ biết và retry
      }
    },
    emailWorkerConfig // Sử dụng config riêng cho email
  );

  // 2. AUCTION TIMER WORKER
  auctionTimerWorker = new Worker(
    QUEUE_NAMES.AUCTION_TIMER,
    async (job: Job) => {
      const { auctionId } = job.data;

      // Gọi hàm finalizeAuction (Hàm này đã có logic check endTime > now)
      const result = await auctionService.finalizeAuction(auctionId);

      if (result.status === "skipped") {
        logger.info(
          `⏩ Skipped finalizing auction #${auctionId} (Extended or Closed)`
        );
      } else {
        logger.info(
          `✅ Auction finalized: #${auctionId} - Result: ${result.result}`
        );
      }
    },
    workerConfig
  );

  // 3. AUTO BID WORKER
  autoBidWorker = new Worker(
    QUEUE_NAMES.AUTO_BID,
    async (job: Job) => {
      const { productId } = job.data;

      logger.info(
        `[AutoBid] Processing product ${productId} at ${new Date().toISOString()}`
      );

      try {
        // Gọi service xử lý logic nghiệp vụ
        await auctionService.processAutoBid(productId);
      } catch (error) {
        logger.error(`[AutoBid] Failed for ${productId}`, error);
        throw error; // Ném lỗi để BullMQ biết và retry (nếu có config)
      }
    },
    {
      ...workerConfig,
      // Concurrency tùy thuộc vào Server Spec và DB Connection Pool
      // Nhưng cần đảm bảo code trong processAutoBid có Transaction Safe
      concurrency: 5,
    }
  );

  const workers = [emailWorker, auctionTimerWorker, autoBidWorker];
  workers.forEach((worker) => {
    worker.on("failed", (job, err) => {
      logger.error(
        `❌ Worker ${worker.name} failed job ${job?.id}: ${err.message}`
      );
    });
    worker.on("error", (err) => {
      logger.error(`❌ Worker ${worker.name} connection error: ${err.message}`);
    });
  });

  logger.info("🚀 All Background Workers are now running!");
};

// Hàm tắt worker an toàn (Graceful Shutdown) - Rất quan trọng khi restart server
export const stopWorkers = async () => {
  logger.info("🛑 Stopping Workers...");
  await Promise.all([
    emailWorker?.close(),
    auctionTimerWorker?.close(),
    autoBidWorker?.close(),
  ]);
  logger.info("✅ Workers Stopped.");
};
