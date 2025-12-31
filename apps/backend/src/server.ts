import logger from "@/config/logger";
import { systemService } from "@/services/system.service";
import { startWorkers, stopWorkers } from "@/workers";

import app from "./app";

const PORT = process.env.PORT || 3000;

let server: ReturnType<typeof app.listen>;

const bootstrap = async () => {
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received. Shutting down...");
    const timeout = setTimeout(() => {
      logger.info("Shutdown timeout, forcing exit...");
      process.exit(0);
    }, 30000); // 30 seconds timeout

    try {
      await stopWorkers(); // Đợi worker làm nốt job đang dang dở rồi mới tắt
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    } catch (error) {
      logger.error("Error during shutdown:", error);
    } finally {
      clearTimeout(timeout);
      process.exit(0);
    }
  });

  try {
    // startWorkers();

    // // Khôi phục các auction đã bỏ sót (đã hết hạn)
    // await systemService.syncMissedAuctions();

    // // Xử lý auto-bid cho các auction đang active
    // await systemService.syncActiveAuctionAutoBids();

    server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

bootstrap();
