import { and, lt, eq, gt } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { auctionTimerQueue, autoBidQueue } from "@/config/queue";
import { products, autoBids } from "@/models";
import { auctionService } from "@/services/auction.service";

class SystemService {
  // ============================================================
  // CONSTANTS
  // ============================================================
  private readonly AUTO_BID_BATCH_SIZE = 50; // Số lượng auction xử lý cùng lúc

  // ============================================================
  // JOB SCHEDULING (Lên lịch)
  // ============================================================

  /**
   * Lên lịch kết thúc phiên đấu giá (Delayed Job)
   * Gọi hàm này khi Tạo đấu giá mới
   */
  async scheduleAuctionEnd(auctionId: string, endTime: Date) {
    const now = new Date().getTime();
    const delay = endTime.getTime() - now;

    if (delay > 0) {
      await auctionTimerQueue.add(
        "finalize-auction",
        { auctionId },
        {
          delay: delay,
          jobId: `auction-end-${auctionId}`, // Đảm bảo không trùng lặp job
          removeOnComplete: true,
        }
      );
      logger.info(
        `⏰ Scheduled auction #${auctionId} to end in ${Math.round(delay / 1000 / 60)} minutes`
      );
    } else {
      logger.warn(
        `⚠️ Cannot schedule auction #${auctionId} to end in the past (endTime: ${endTime.toISOString()}), finalizing immediately.`
      );
      await auctionService.finalizeAuction(auctionId);
    }
  }

  /**
   * Reschedule kết thúc đấu giá (dùng cho auto-extend)
   */
  async rescheduleAuctionEnd(auctionId: string, endTime: Date) {
    const jobId = `auction-end-${auctionId}`;
    const existingJob = await auctionTimerQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
    }
    await this.scheduleAuctionEnd(auctionId, endTime);
  }

  /**
   * Kích hoạt kiểm tra Auto Bid
   * Gọi hàm này khi có người Ra giá (Place Bid)
   */
  async triggerAutoBidCheck(productId: string) {
    // Sử dụng jobId cố định theo productId để tránh duplicate job
    // khi có nhiều người bid cùng lúc.
    const jobId = `auto-bid-${productId}`;

    await autoBidQueue.add(
      "process-auto-bid",
      { productId },
      {
        jobId: jobId, // Key để Deduplication
        removeOnComplete: true,
        removeOnFail: 100, // Giữ lại để debug nếu lỗi
        priority: 1,
      }
    );
  }

  // ============================================================
  // SYSTEM RECOVERY (Khôi phục sự cố)
  // ============================================================

  /**
   * Quét các đấu giá bị sót do Server sập (Safety Net)
   * Chạy 1 lần duy nhất khi Server khởi động
   */
  async syncMissedAuctions() {
    logger.info("🔄 System Recovery: Scanning for missed auctions...");
    const now = new Date();

    // Tìm các đấu giá đã quá hạn (endTime < now) mà status vẫn là ACTIVE
    const missedAuctions = await db.query.products.findMany({
      where: and(eq(products.status, "ACTIVE"), lt(products.endTime, now)),
      limit: 500,
    });

    if (!missedAuctions.length) {
      logger.info("✅ System Recovery: No missed auctions found.");
      return;
    }

    logger.warn(
      `⚠️ System Recovery: Found ${missedAuctions.length} missed auctions. Recovering...`
    );

    for (const auction of missedAuctions) {
      // Lên lịch lại job kết thúc đấu giá ngay lập tức
      await this.rescheduleAuctionEnd(auction.id, auction.endTime);
    }

    logger.info("✅ System Recovery: Recovery jobs enqueued.");
  }

  /**
   * Xử lý lại auto-bid cho các đấu giá đang active
   * Chạy asynchronously sau khi Server khởi động để không block startup
   */
  async syncActiveAuctionAutoBids() {
    logger.info(
      "🔄 System Recovery: Scheduling auto-bid processing for active auctions..."
    );

    // Chạy asynchronously để không block server startup
    setImmediate(async () => {
      try {
        await this.processActiveAuctionAutoBidsAsync();
      } catch (error) {
        logger.error("❌ System Recovery: Failed to process auto-bids:", error);
      }
    });

    logger.info(
      "✅ System Recovery: Auto-bid processing scheduled (running in background)"
    );
  }

  /**
   * Xử lý auto-bid cho các auction đang active trong background
   * Sử dụng Promise.allSettled() để xử lý theo batch
   */
  private async processActiveAuctionAutoBidsAsync() {
    const now = new Date();

    // Lấy tất cả auction đang active và chưa hết hạn
    const activeAuctions = await db.query.products.findMany({
      where: and(eq(products.status, "ACTIVE"), gt(products.endTime, now)),
      limit: 500,
    });

    if (!activeAuctions.length) {
      logger.info("✅ System Recovery: No active auctions found.");
      return;
    }

    logger.info(
      `🔄 System Recovery: Found ${activeAuctions.length} active auctions. Processing auto-bids in batches of ${this.AUTO_BID_BATCH_SIZE}...`
    );

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Xử lý theo batch để tránh overload
    for (let i = 0; i < activeAuctions.length; i += this.AUTO_BID_BATCH_SIZE) {
      const batch = activeAuctions.slice(i, i + this.AUTO_BID_BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (auction) => {
          // Kiểm tra xem auction này có auto-bids không
          const hasAutoBids = await db.query.autoBids.findFirst({
            where: and(
              eq(autoBids.productId, auction.id),
              eq(autoBids.isActive, true)
            ),
          });

          if (!hasAutoBids) {
            return { success: true, skipped: true, auctionId: auction.id };
          }

          // Xử lý auto-bid cho auction này
          const result = await auctionService.processAutoBid(auction.id);
          if (result.status === "ok") {
            logger.info(
              `✅ Processed auto-bid for auction #${auction.id} - Winner: ${result.winnerId}`
            );
            return { success: true, skipped: false, auctionId: auction.id };
          }

          return { success: false, skipped: false, auctionId: auction.id };
        })
      );

      // Đếm kết quả
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success && !result.value.skipped) {
            processedCount++;
          } else if (result.value.success && result.value.skipped) {
            skippedCount++;
          } else if (!result.value.success) {
            errorCount++;
          }
        } else if (result.status === "rejected") {
          errorCount++;
          logger.error(`❌ Error processing auto-bid: ${result.reason}`);
        }
      });

      logger.info(
        `🔄 System Recovery: Processed batch ${Math.floor(i / this.AUTO_BID_BATCH_SIZE) + 1}/${Math.ceil(activeAuctions.length / this.AUTO_BID_BATCH_SIZE)}`
      );
    }

    logger.info(
      `✅ System Recovery: Auto-bid processing completed. Processed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`
    );
  }
}

export const systemService = new SystemService();
