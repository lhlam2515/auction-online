import logger from "@/config/logger";
import { systemService } from "@/services/system.service";
import { startWorkers, stopWorkers } from "@/workers";

import app from "./app";

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    startWorkers();

    // Khôi phục các auction đã bỏ sót (đã hết hạn)
    await systemService.syncMissedAuctions();

    // Xử lý auto-bid cho các auction đang active
    await systemService.syncActiveAuctionAutoBids();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });

    process.on("SIGTERM", async () => {
      console.log("SIGTERM received. Shutting down...");
      await stopWorkers(); // Đợi worker làm nốt job đang dang dở rồi mới tắt
      server.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
  }
};

bootstrap();
