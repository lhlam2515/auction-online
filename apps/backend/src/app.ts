import express from "express";
import logger from "@/config/logger";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler, notFound } from "@/middlewares/error-handler";
import { ResponseHandler } from "@/utils/response";
import routes from "@/routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get("/", (req, res) => {
  logger.info("Hello from Auction Online Backend!");

  ResponseHandler.sendSuccess(res, {
    message: "Hello from Auction Online Backend!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1", routes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
