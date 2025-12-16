import { and, lt, eq } from "drizzle-orm";

import { db } from "@/config/database";
import logger from "@/config/logger";
import { auctionTimerQueue } from "@/config/queue";
import { products } from "@/models";

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
}

export const systemService = new SystemService();
