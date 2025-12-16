import { and, lt, eq, gt } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { auctionTimerQueue, autoBidQueue } from "@/config/queue";
import { products, autoBids } from "@/models";
import { auctionService } from "@/services/auction.service";

class SystemService {
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
    await autoBidQueue.add(
      "process-auto-bid",
      { productId },
      {
        removeOnComplete: true,
        priority: 1, // Ưu tiên cao
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
      // Xử lý ngay lập tức (delay = 0)
      await auctionTimerQueue.add(
        "finalize-auction",
        { auctionId: auction.id },
        {
          jobId: `auction-recovery-${auction.id}`,
          removeOnComplete: true,
        }
      );
    }

    logger.info("✅ System Recovery: Recovery jobs enqueued.");
  }

  /**
   * Xử lý lại auto-bid cho các đấu giá đang active
   * Chạy khi Server khởi động để đảm bảo auto-bid không bị bỏ sót
   */
  async syncActiveAuctionAutoBids() {
    logger.info(
      "🔄 System Recovery: Processing auto-bids for active auctions..."
    );
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
      `🔄 System Recovery: Found ${activeAuctions.length} active auctions. Processing auto-bids...`
    );

    let processedCount = 0;
    let errorCount = 0;

    for (const auction of activeAuctions) {
      try {
        // Kiểm tra xem auction này có auto-bids không
        const hasAutoBids = await db.query.autoBids.findFirst({
          where: and(
            eq(autoBids.productId, auction.id),
            eq(autoBids.isActive, true)
          ),
        });

        if (hasAutoBids) {
          // Xử lý auto-bid cho auction này
          const result = await auctionService.processAutoBid(auction.id);
          if (result.status === "ok") {
            processedCount++;
            logger.info(
              `✅ Processed auto-bid for auction #${auction.id} - Winner: ${result.winnerId}`
            );
          }
        }
      } catch (error) {
        errorCount++;
        logger.error(
          `❌ Error processing auto-bid for auction #${auction.id}:`,
          error
        );
      }
    }

    logger.info(
      `✅ System Recovery: Auto-bid processing completed. Processed: ${processedCount}, Errors: ${errorCount}`
    );
  }
}

export const systemService = new SystemService();
