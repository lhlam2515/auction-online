import { Worker, Job } from "bullmq";

import logger from "@/config/logger";
import { redisConnection, QUEUE_NAMES } from "@/config/queue";
import { auctionService } from "@/services/auction.service";
import { emailService } from "@/services/email.service";

// Khai báo biến global để quản lý worker
let emailWorker: Worker;
let auctionTimerWorker: Worker;
let autoBidWorker: Worker;

export const startWorkers = () => {
  if (emailWorker && auctionTimerWorker && autoBidWorker) return; // Tránh khởi tạo 2 lần

  logger.info("⚙️ Starting Background Workers...");

  // 1. EMAIL WORKER
  emailWorker = new Worker(
    QUEUE_NAMES.EMAIL,
    async (job: Job) => {
      const { to, subject, html } = job.data;
      await emailService.processEmailJob(to, subject, html);
    },
    { connection: redisConnection }
  );

  // 2. AUCTION TIMER WORKER
  auctionTimerWorker = new Worker(
    QUEUE_NAMES.AUCTION_TIMER,
    async (job: Job) => {
      const { auctionId } = job.data;
      await auctionService.finalizeAuction(auctionId);
      logger.info(`⏳ Auction finalized: #${auctionId}`);
    },
    { connection: redisConnection }
  );

  // 3. AUTO BID WORKER
  autoBidWorker = new Worker(
    QUEUE_NAMES.AUTO_BID,
    async (job: Job) => {
      const { productId } = job.data;
      await auctionService.processAutoBid(productId);
    },
    { connection: redisConnection }
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
