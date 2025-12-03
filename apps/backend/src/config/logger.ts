import { config } from "dotenv";
import winston from "winston";
import path from "path";

config({ path: ".env" });

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = combine(
  colorize({ all: true }),
  printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${level}: ${message} ${metaStr}`;
  })
);

// Structured format for file output
const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  defaultMeta: {
    service: "auction-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

// Console transport for non-production
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;
